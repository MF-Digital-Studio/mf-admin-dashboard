import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  mapPrismaProjectToEditable,
  mapPrismaProjectToProject,
  mapProjectPriorityToPrisma,
  mapProjectServiceToPrisma,
  mapProjectStatusToPrisma,
} from '@/features/projects/mappers'
import { mapPrismaTaskToTask } from '@/features/tasks/mappers'
import { projectPayloadSchema } from '@/features/projects/schemas'
import { createCrudNotification } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
        },
      },
      tasks: {
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
      },
    },
  })

  if (!project) {
    return NextResponse.json({ message: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({
    project: mapPrismaProjectToProject(project),
    editable: mapPrismaProjectToEditable(project),
    tasks: project.tasks.map(mapPrismaTaskToTask),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const parsed = projectPayloadSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'At least one field is required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (parsed.data.name !== undefined) data.name = parsed.data.name
  if (parsed.data.clientId !== undefined) data.clientId = parsed.data.clientId
  if (parsed.data.service !== undefined) data.category = mapProjectServiceToPrisma(parsed.data.service)
  if (parsed.data.status !== undefined) data.status = mapProjectStatusToPrisma(parsed.data.status)
  if (parsed.data.priority !== undefined) data.priority = mapProjectPriorityToPrisma(parsed.data.priority)
  if (parsed.data.budget !== undefined) data.budget = parsed.data.budget
  if (parsed.data.startDate !== undefined) data.startDate = new Date(parsed.data.startDate)
  if (parsed.data.deadline !== undefined) data.deadline = new Date(parsed.data.deadline)
  if (parsed.data.description !== undefined) data.notes = parsed.data.description || null

  try {
    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        tasks: {
          select: {
            status: true,
          },
        },
      },
    })

    await createCrudNotification({
      action: 'updated',
      entityType: 'PROJECT',
      entityId: updated.id,
      entityLabel: 'Proje',
      detail: updated.name,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaProjectToProject(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025' || error.code === 'P2003') {
        return NextResponse.json({ message: 'Project or client not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params

  try {
    const deleted = await prisma.project.delete({
      where: { id },
    })

    await createCrudNotification({
      action: 'deleted',
      entityType: 'PROJECT',
      entityId: deleted.id,
      entityLabel: 'Proje',
      detail: deleted.name,
    }).catch(() => undefined)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete project' }, { status: 500 })
  }
}
