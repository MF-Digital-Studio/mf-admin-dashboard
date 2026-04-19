import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPaymentCategoryToPrisma, mapPaymentStatusToPrisma, mapPrismaPaymentToPayment } from '@/features/finance/mappers'
import { paymentPayloadSchema } from '@/features/finance/schemas'
import { createCrudNotification } from '@/lib/notifications'

export async function GET() {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const payments = await prisma.payment.findMany({
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

  return NextResponse.json(payments.map(mapPrismaPaymentToPayment))
}

export async function POST(request: Request) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
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
    const created = await prisma.payment.create({
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
      action: 'created',
      entityType: 'PAYMENT',
      entityId: created.id,
      entityLabel: 'Ödeme',
      detail: `${created.client.companyName} - ${created.amount.toString()}`,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaPaymentToPayment(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Client or project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to create payment' }, { status: 500 })
  }
}

