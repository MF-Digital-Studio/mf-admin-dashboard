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
  const { id } = await params
  const body = await request.json()
  const parsed = paymentPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (parsed.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { id: true, clientId: true },
    })

    if (!project || project.clientId !== parsed.data.clientId) {
      return NextResponse.json({ message: 'Project does not belong to selected client' }, { status: 400 })
    }
  }

  try {
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        clientId: parsed.data.clientId,
        projectId: parsed.data.projectId,
        amount: parsed.data.amount,
        category: mapPaymentCategoryToPrisma(parsed.data.category),
        status: mapPaymentStatusToPrisma(parsed.data.status),
        paymentMethod: parsed.data.method,
        paidAt: new Date(parsed.data.date),
        notes: parsed.data.notes || null,
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

    return NextResponse.json({ message: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
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
