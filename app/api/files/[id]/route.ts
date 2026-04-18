import { del } from '@vercel/blob'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { mapPrismaFileToFileRecord } from '@/features/files/mappers'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const file = await prisma.storedFile.findUnique({
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

  if (!file) {
    return NextResponse.json({ message: 'File not found' }, { status: 404 })
  }

  return NextResponse.json({
    file: mapPrismaFileToFileRecord(file),
  })
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  const file = await prisma.storedFile.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      blobUrl: true,
    },
  })

  if (!file) {
    return NextResponse.json({ message: 'File not found' }, { status: 404 })
  }

  try {
    await del(file.blobUrl)
    await prisma.storedFile.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete file' }, { status: 500 })
  }
}
