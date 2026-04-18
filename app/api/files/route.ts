import { del, put } from '@vercel/blob'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { mapFileCategoryToPrisma, mapPrismaFileToFileRecord } from '@/features/files/mappers'
import { fileUploadPayloadSchema } from '@/features/files/schemas'
import { prisma } from '@/lib/prisma'

function normalizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function getExtension(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  return ext && ext.length > 0 ? ext : 'file'
}

function normalizeOptionalId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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
    const files = await prisma.storedFile.findMany({
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
        createdAt: 'desc',
      },
    })

    return NextResponse.json(files.map(mapPrismaFileToFileRecord))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('GET /api/files failed, returning empty array fallback', error)
    }
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const fileEntry = formData.get('file')

  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return NextResponse.json({ message: 'File is required' }, { status: 400 })
  }

  const parsed = fileUploadPayloadSchema.safeParse({
    category: formData.get('category'),
    clientId: normalizeOptionalId(formData.get('clientId')),
    projectId: normalizeOptionalId(formData.get('projectId')),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  let resolvedClientId = parsed.data.clientId
  let resolvedProjectId = parsed.data.projectId

  if (resolvedProjectId) {
    const project = await prisma.project.findUnique({
      where: {
        id: resolvedProjectId,
      },
      select: {
        id: true,
        clientId: true,
      },
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (resolvedClientId && resolvedClientId !== project.clientId) {
      return NextResponse.json({ message: 'Project does not belong to selected client' }, { status: 400 })
    }

    resolvedClientId = resolvedClientId ?? project.clientId
    resolvedProjectId = project.id
  }

  if (resolvedClientId) {
    const client = await prisma.client.findUnique({
      where: {
        id: resolvedClientId,
      },
      select: {
        id: true,
      },
    })

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }
  }

  const safeName = normalizeFileName(fileEntry.name)
  const pathname = `uploads/${Date.now()}-${crypto.randomUUID()}-${safeName}`

  let blobUrl: string | null = null

  try {
    const uploaded = await put(pathname, fileEntry, {
      access: 'public',
      addRandomSuffix: false,
    })

    blobUrl = uploaded.url

    const created = await prisma.storedFile.create({
      data: {
        name: fileEntry.name,
        blobUrl: uploaded.url,
        blobPathname: uploaded.pathname,
        sizeBytes: fileEntry.size,
        mimeType: fileEntry.type || 'application/octet-stream',
        extension: getExtension(fileEntry.name),
        category: mapFileCategoryToPrisma(parsed.data.category),
        notes: parsed.data.notes || null,
        clientId: resolvedClientId,
        projectId: resolvedProjectId,
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

    return NextResponse.json(mapPrismaFileToFileRecord(created), { status: 201 })
  } catch (error) {
    if (blobUrl) {
      await del(blobUrl).catch(() => undefined)
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ message: 'A file with this blob path already exists' }, { status: 409 })
      }

      if (error.code === 'P2003') {
        return NextResponse.json({ message: 'Client or project not found' }, { status: 404 })
      }
    }

    return withDevError('Failed to upload file', error, 500)
  }
}
