import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapNoteCategoryToPrisma, mapNoteRelatedTypeToPrisma, mapPrismaNoteToNote } from '@/features/notes/mappers'
import { notePayloadSchema } from '@/features/notes/schemas'

export async function GET() {
  const notes = await prisma.note.findMany({
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return NextResponse.json(notes.map(mapPrismaNoteToNote))
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = notePayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const created = await prisma.note.create({
      data: {
        title: parsed.data.title,
        category: mapNoteCategoryToPrisma(parsed.data.category),
        relatedType: mapNoteRelatedTypeToPrisma(parsed.data.relatedType),
        clientId: parsed.data.relatedType === 'client' ? parsed.data.clientId : null,
        projectId: parsed.data.relatedType === 'project' ? parsed.data.projectId : null,
        content: parsed.data.content,
        tags: parsed.data.tags,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(mapPrismaNoteToNote(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Client or project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to create note' }, { status: 500 })
  }
}
