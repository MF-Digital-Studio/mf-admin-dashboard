import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaProjectToProject, mapProjectPriorityToPrisma, mapProjectServiceToPrisma, mapProjectStatusToPrisma } from '@/features/projects/mappers'
import { projectPayloadSchema } from '@/features/projects/schemas'

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(projects.map(mapPrismaProjectToProject))
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = projectPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const created = await prisma.project.create({
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

    return NextResponse.json(mapPrismaProjectToProject(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to create project' }, { status: 500 })
  }
}
