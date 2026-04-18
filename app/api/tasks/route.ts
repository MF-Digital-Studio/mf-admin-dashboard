import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapPrismaTaskToTask, mapTaskPriorityToPrisma, mapTaskStatusToPrisma } from '@/features/tasks/mappers'
import { taskPayloadSchema } from '@/features/tasks/schemas'

export async function GET() {
  const tasks = await prisma.task.findMany({
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

  return NextResponse.json(mapPrismaTaskToTask(created), { status: 201 })
}
