import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  mapPrismaClientToClientSummary,
  mapPrismaClientToEditable,
  mapPrismaPaymentToClientDetail,
  mapPrismaProjectToClientDetail,
  mapServiceToPrisma,
  mapStatusToPrisma,
} from '@/features/clients/mappers'
import { clientPayloadSchema } from '@/features/clients/schemas'
import { createCrudNotification } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
          tasks: {
            select: {
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!client) {
    return NextResponse.json({ message: 'Client not found' }, { status: 404 })
  }

  const projectsWithTaskSummary = client.projects.map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    taskCount: project.tasks.length,
    completedTaskCount: project.tasks.filter((task) => task.status === 'DONE').length,
  }))

  return NextResponse.json({
    client: mapPrismaClientToClientSummary(client),
    editable: mapPrismaClientToEditable(client),
    projects: projectsWithTaskSummary.map(mapPrismaProjectToClientDetail),
    payments: client.payments.map(mapPrismaPaymentToClientDetail),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const parsed = clientPayloadSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'At least one field is required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (parsed.data.company !== undefined) data.companyName = parsed.data.company
  if (parsed.data.contact !== undefined) data.contactPerson = parsed.data.contact
  if (parsed.data.email !== undefined) data.email = parsed.data.email
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone
  if (parsed.data.instagram !== undefined) data.instagram = parsed.data.instagram || null
  if (parsed.data.service !== undefined) data.serviceType = mapServiceToPrisma(parsed.data.service)
  if (parsed.data.status !== undefined) data.status = mapStatusToPrisma(parsed.data.status)
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null

  try {
    const updated = await prisma.client.update({
      where: { id },
      data,
      include: {
        projects: {
          select: {
            status: true,
          },
        },
        payments: {
          select: {
            amount: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    })

    await createCrudNotification({
      action: 'updated',
      entityType: 'CLIENT',
      entityId: updated.id,
      entityLabel: 'Müşteri',
      detail: updated.companyName,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaClientToClientSummary(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Client not found' }, { status: 404 })
      }

      if (error.code === 'P2002') {
        return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
      }
    }

    return NextResponse.json({ message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params

  try {
    const deleted = await prisma.client.delete({
      where: { id },
    })

    await createCrudNotification({
      action: 'deleted',
      entityType: 'CLIENT',
      entityId: deleted.id,
      entityLabel: 'Müşteri',
      detail: deleted.companyName,
    }).catch(() => undefined)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 })
  }
}
