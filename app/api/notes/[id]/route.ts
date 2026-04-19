import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapNoteCategoryToPrisma, mapNoteRelatedTypeToPrisma, mapPrismaNoteToEditable, mapPrismaNoteToNote } from '@/features/notes/mappers'
import { notePayloadSchema } from '@/features/notes/schemas'
import { createCrudNotification } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const note = await prisma.note.findUnique({
    where: { id },
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

  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 })
  }

  return NextResponse.json({
    note: mapPrismaNoteToNote(note),
    editable: mapPrismaNoteToEditable(note),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const body = await request.json()
  const parsed = notePayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const updated = await prisma.note.update({
      where: { id },
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
      action: 'updated',
      entityType: 'NOTE',
      entityId: updated.id,
      entityLabel: 'Not',
      detail: updated.title,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaNoteToNote(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025' || error.code === 'P2003') {
        return NextResponse.json({ message: 'Note, client, or project not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params

  try {
    const deleted = await prisma.note.delete({
      where: { id },
    })

    await createCrudNotification({
      action: 'deleted',
      entityType: 'NOTE',
      entityId: deleted.id,
      entityLabel: 'Not',
      detail: deleted.title,
    }).catch(() => undefined)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete note' }, { status: 500 })
  }
}

