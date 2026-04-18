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
import { projectPayloadSchema } from '@/features/projects/schemas'

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
    },
  })

  if (!project) {
    return NextResponse.json({ message: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({
    project: mapPrismaProjectToProject(project),
    editable: mapPrismaProjectToEditable(project),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const parsed = projectPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: parsed.data.name,
        clientId: parsed.data.clientId,
        category: mapProjectServiceToPrisma(parsed.data.service),
        status: mapProjectStatusToPrisma(parsed.data.status),
        priority: mapProjectPriorityToPrisma(parsed.data.priority),
        budget: parsed.data.budget,
        startDate: new Date(parsed.data.startDate),
        deadline: new Date(parsed.data.deadline),
        progress: parsed.data.progress,
        notes: parsed.data.description || null,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    })

    return NextResponse.json(mapPrismaProjectToProject(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025' || error.code === 'P2003') {
        return NextResponse.json({ message: 'Project or client not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params

  try {
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete project' }, { status: 500 })
  }
}
