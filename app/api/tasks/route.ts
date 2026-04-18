import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapPrismaTaskToTask, mapTaskPriorityToPrisma, mapTaskStatusToPrisma } from '@/features/tasks/mappers'
import { taskPayloadSchema } from '@/features/tasks/schemas'
import { createCrudNotification } from '@/lib/notifications'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  const tasks = await prisma.task.findMany({
    where: projectId ? { projectId } : undefined,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(tasks.map(mapPrismaTaskToTask))
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = taskPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: {
      id: parsed.data.projectId,
    },
    select: {
      id: true,
      clientId: true,
    },
  })

  if (!project) {
    return NextResponse.json({ message: 'Project not found' }, { status: 404 })
  }

  const created = await prisma.task.create({
    data: {
      title: parsed.data.title,
      projectId: project.id,
      clientId: project.clientId,
      assignee: parsed.data.assignedTo,
      priority: mapTaskPriorityToPrisma(parsed.data.priority),
      status: mapTaskStatusToPrisma(parsed.data.status),
      dueDate: new Date(parsed.data.dueDate),
      notes: parsed.data.notes || null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  await createCrudNotification({
    action: 'created',
    entityType: 'TASK',
    entityId: created.id,
    entityLabel: 'Görev',
    detail: created.title,
  }).catch(() => undefined)

  return NextResponse.json(mapPrismaTaskToTask(created), { status: 201 })
}
