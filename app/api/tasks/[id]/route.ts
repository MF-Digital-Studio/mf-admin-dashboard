import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaTaskToEditable, mapPrismaTaskToTask, mapTaskPriorityToPrisma, mapTaskStatusToPrisma } from '@/features/tasks/mappers'
import { taskPayloadSchema } from '@/features/tasks/schemas'
import { createCrudNotification } from '@/lib/notifications'
import { resolveTaskBillingState } from '@/features/tasks/billing'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
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
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const body = await request.json()
  const parsed = taskPayloadSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'At least one field is required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  let currentTask: { status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED'; price: { toString(): string } | null; billingState: 'PENDING' | 'READY_TO_BILL' | 'BILLED' } | null = null

  if (parsed.data.status !== undefined || parsed.data.price !== undefined) {
    currentTask = await prisma.task.findUnique({
      where: { id },
      select: {
        status: true,
        price: true,
        billingState: true,
      },
    })

    if (!currentTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }
  }

  if (parsed.data.projectId !== undefined) {
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

    data.projectId = project.id
    data.clientId = project.clientId
  }

  if (parsed.data.title !== undefined) data.title = parsed.data.title
  if (parsed.data.assignedTo !== undefined) data.assignee = parsed.data.assignedTo
  if (parsed.data.priority !== undefined) data.priority = mapTaskPriorityToPrisma(parsed.data.priority)
  if (parsed.data.status !== undefined) data.status = mapTaskStatusToPrisma(parsed.data.status)
  if (parsed.data.price !== undefined) data.price = parsed.data.price
  if (parsed.data.dueDate !== undefined) data.dueDate = new Date(parsed.data.dueDate)
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null

  if (currentTask) {
    const nextStatus = parsed.data.status !== undefined ? mapTaskStatusToPrisma(parsed.data.status) : currentTask.status
    const nextPrice = parsed.data.price !== undefined ? parsed.data.price : (currentTask.price ? Number(currentTask.price.toString()) : null)

    data.billingState = resolveTaskBillingState({
      status: nextStatus,
      price: nextPrice,
      currentState: currentTask.billingState,
    })
  }

  try {
    const updated = await prisma.task.update({
      where: { id },
      data,
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
      action: 'updated',
      entityType: 'TASK',
      entityId: updated.id,
      entityLabel: 'Görev',
      detail: updated.title,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaTaskToTask(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params

  try {
    const deleted = await prisma.task.delete({
      where: { id },
    })

    await createCrudNotification({
      action: 'deleted',
      entityType: 'TASK',
      entityId: deleted.id,
      entityLabel: 'Görev',
      detail: deleted.title,
    }).catch(() => undefined)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 })
  }
}

