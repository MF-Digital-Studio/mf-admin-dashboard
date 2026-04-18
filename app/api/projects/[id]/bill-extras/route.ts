import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaPaymentToPayment } from '@/features/finance/mappers'
import { createCrudNotification } from '@/lib/notifications'
import { getExtraPaymentMarker, getLegacyMainPaymentMarker, getMainPaymentMarker } from '@/lib/project-billing'

interface Params {
  params: Promise<{ id: string }>
}

const DEFAULT_PAYMENT_METHOD = 'Banka Havalesi'

export async function POST(_: Request, { params }: Params) {
  const { id } = await params
  const mainMarker = getMainPaymentMarker(id)
  const legacyMainMarker = getLegacyMainPaymentMarker(id)
  const extraMarker = getExtraPaymentMarker(id)
  const today = new Date()

  try {
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          category: true,
          clientId: true,
          tasks: {
            where: {
              status: 'DONE',
              price: {
                not: null,
              },
              billingState: {
                not: 'BILLED',
              },
            },
            select: {
              id: true,
              title: true,
              price: true,
              billingState: true,
            },
          },
        },
      })

      if (!project) {
        return { type: 'not_found' as const }
      }

      const hasMainPayment = await tx.payment.findFirst({
        where: {
          projectId: project.id,
          status: 'PAID',
          OR: [
            { notes: { contains: mainMarker } },
            { notes: { contains: legacyMainMarker } },
          ],
        },
        select: { id: true },
      })

      if (!hasMainPayment) {
        return { type: 'main_not_completed' as const }
      }

      if (project.tasks.length === 0) {
        return { type: 'nothing_to_bill' as const }
      }

      const taskIds = project.tasks.map((task) => task.id)
      const amount = project.tasks.reduce((sum, task) => sum + Number(task.price?.toString() ?? 0), 0)

      const lockResult = await tx.task.updateMany({
        where: {
          id: {
            in: taskIds,
          },
          billingState: {
            not: 'BILLED',
          },
        },
        data: {
          billingState: 'BILLED',
        },
      })

      if (lockResult.count === 0) {
        return { type: 'nothing_to_bill' as const }
      }

      const createdPayment = await tx.payment.create({
        data: {
          clientId: project.clientId,
          projectId: project.id,
          amount,
          category: project.category,
          status: 'PAID',
          paymentMethod: DEFAULT_PAYMENT_METHOD,
          paidAt: today,
          notes: `${extraMarker} ${project.name} tamamlanan ek işler tahsil edildi (${lockResult.count} alt görev)`,
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

      return {
        type: 'created' as const,
        payment: createdPayment,
        billedTaskCount: lockResult.count,
      }
    })

    if (result.type === 'not_found') {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (result.type === 'main_not_completed') {
      return NextResponse.json({ message: 'Main project payment must be completed first' }, { status: 400 })
    }

    if (result.type === 'nothing_to_bill') {
      return NextResponse.json({ message: 'No completed unbilled priced subtasks' }, { status: 400 })
    }

    await createCrudNotification({
      action: 'created',
      entityType: 'PAYMENT',
      entityId: result.payment.id,
      entityLabel: 'Ödeme',
      detail: `Ek işler tahsil edildi (${result.billedTaskCount} alt görev)`,
    }).catch(() => undefined)

    return NextResponse.json({
      payment: mapPrismaPaymentToPayment(result.payment),
      billedTaskCount: result.billedTaskCount,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Project or client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to bill extras' }, { status: 500 })
  }
}

