import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPaymentCategoryToPrisma, mapPaymentStatusToPrisma, mapPrismaPaymentToEditable, mapPrismaPaymentToPayment } from '@/features/finance/mappers'
import { paymentPayloadSchema } from '@/features/finance/schemas'
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
  const payment = await prisma.payment.findUnique({
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

  if (!payment) {
    return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
  }

  return NextResponse.json({
    payment: mapPrismaPaymentToPayment(payment),
    editable: mapPrismaPaymentToEditable(payment),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const body = await request.json()
  const parsed = paymentPayloadSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'At least one field is required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (parsed.data.projectId !== undefined) {
    if (parsed.data.projectId !== null) {
      const project = await prisma.project.findUnique({
        where: { id: parsed.data.projectId },
        select: { id: true, clientId: true },
      })

      if (!project) {
        return NextResponse.json({ message: 'Project not found' }, { status: 404 })
      }

      if (parsed.data.clientId !== undefined && project.clientId !== parsed.data.clientId) {
        return NextResponse.json({ message: 'Project does not belong to selected client' }, { status: 400 })
      }

      data.projectId = project.id
      data.clientId = project.clientId
    } else {
      data.projectId = null
    }
  }

  if (parsed.data.clientId !== undefined) data.clientId = parsed.data.clientId
  if (parsed.data.amount !== undefined) data.amount = parsed.data.amount
  if (parsed.data.category !== undefined) data.category = mapPaymentCategoryToPrisma(parsed.data.category)
  if (parsed.data.status !== undefined) data.status = mapPaymentStatusToPrisma(parsed.data.status)
  if (parsed.data.method !== undefined) data.paymentMethod = parsed.data.method
  if (parsed.data.date !== undefined) data.paidAt = new Date(parsed.data.date)
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null

  try {
    const updated = await prisma.payment.update({
      where: { id },
      data,
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
      entityType: 'PAYMENT',
      entityId: updated.id,
      entityLabel: 'Ödeme',
      detail: `${updated.client.companyName} - ${updated.amount.toString()}`,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaPaymentToPayment(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025' || error.code === 'P2003') {
        return NextResponse.json({ message: 'Payment, client, or project not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params

  try {
    const deleted = await prisma.payment.delete({
      where: { id },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
      },
    })

    await createCrudNotification({
      action: 'deleted',
      entityType: 'PAYMENT',
      entityId: deleted.id,
      entityLabel: 'Ödeme',
      detail: `${deleted.client.companyName} - ${deleted.amount.toString()}`,
    }).catch(() => undefined)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete payment' }, { status: 500 })
  }
}

