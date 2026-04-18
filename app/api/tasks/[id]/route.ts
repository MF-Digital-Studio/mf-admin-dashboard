import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaTaskToEditable, mapPrismaTaskToTask, mapTaskPriorityToPrisma, mapTaskStatusToPrisma } from '@/features/tasks/mappers'
import { taskPayloadSchema } from '@/features/tasks/schemas'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!task) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({
    task: mapPrismaTaskToTask(task),
    editable: mapPrismaTaskToEditable(task),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
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

  try {
    const updated = await prisma.task.update({
      where: { id },
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

    return NextResponse.json(mapPrismaTaskToTask(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params

  try {
    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 })
  }
}
