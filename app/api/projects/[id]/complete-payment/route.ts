import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaPaymentToPayment } from '@/features/finance/mappers'
import { createCrudNotification } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

const DEFAULT_PAYMENT_METHOD = 'Banka Havalesi'

export async function POST(_: Request, { params }: Params) {
  const { id } = await params
  const marker = `[PROJECT_PAYMENT_COMPLETED:${id}]`
  const today = new Date()

  try {
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          category: true,
          budget: true,
          clientId: true,
          client: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      })

      if (!project) {
        return { type: 'not_found' as const }
      }

      const existingPaid = await tx.payment.findFirst({
        where: {
          projectId: project.id,
          status: 'PAID',
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
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (existingPaid) {
        return { type: 'already_done' as const, payment: existingPaid }
      }

      const createdPayment = await tx.payment.create({
        data: {
          clientId: project.clientId,
          projectId: project.id,
          amount: project.budget ?? 0,
          category: project.category,
          status: 'PAID',
          paymentMethod: DEFAULT_PAYMENT_METHOD,
          paidAt: today,
          notes: `${marker} ${project.name} proje ödemesi tamamlandı`,
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

      return { type: 'created' as const, payment: createdPayment, projectName: project.name }
    })

    if (result.type === 'not_found') {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (result.type === 'already_done') {
      return NextResponse.json({
        alreadyCompleted: true,
        payment: mapPrismaPaymentToPayment(result.payment),
      })
    }

    await createCrudNotification({
      action: 'created',
      entityType: 'PAYMENT',
      entityId: result.payment.id,
      entityLabel: 'Ödeme',
      detail: `${result.projectName} proje ödemesi tamamlandı`,
    }).catch(() => undefined)

    return NextResponse.json({
      alreadyCompleted: false,
      payment: mapPrismaPaymentToPayment(result.payment),
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Project or client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to complete project payment' }, { status: 500 })
  }
}

