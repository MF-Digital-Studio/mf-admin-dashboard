import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapNoteCategoryToPrisma, mapNoteRelatedTypeToPrisma, mapPrismaNoteToNote } from '@/features/notes/mappers'
import { notePayloadSchema } from '@/features/notes/schemas'
import { createCrudNotification } from '@/lib/notifications'

function normalizeOptionalId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

function withDevError(message: string, error: unknown, status = 500) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message }, { status })
  }

  const details =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? { code: error.code, meta: error.meta, name: error.name }
      : error instanceof Error
        ? { name: error.name, message: error.message }
        : { message: String(error) }

  return NextResponse.json({ message, details }, { status })
}

export async function GET() {
  try {
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
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('GET /api/notes failed, returning empty array fallback', error)
    }
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const parsed = notePayloadSchema.safeParse({
    ...body,
    category: typeof body.category === 'string' ? body.category : '',
    content: typeof body.content === 'string' ? body.content : '',
    relatedType: typeof body.relatedType === 'string' ? body.relatedType : 'internal',
    clientId: normalizeOptionalId(body.clientId),
    projectId: normalizeOptionalId(body.projectId),
    tags: normalizeTags(body.tags),
  })

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

    await createCrudNotification({
      action: 'created',
      entityType: 'NOTE',
      entityId: created.id,
      entityLabel: 'Not',
      detail: created.title,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaNoteToNote(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Client or project not found' }, { status: 404 })
    }

    return withDevError('Failed to create note', error, 500)
  }
}
