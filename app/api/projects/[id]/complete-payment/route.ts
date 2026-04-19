import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaPaymentToPayment } from '@/features/finance/mappers'
import { createCrudNotification } from '@/lib/notifications'
import { getLegacyMainPaymentMarker, getMainPaymentMarker } from '@/lib/project-billing'

interface Params {
  params: Promise<{ id: string }>
}

const DEFAULT_PAYMENT_METHOD = 'Banka Havalesi'

export async function POST(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const marker = getMainPaymentMarker(id)
  const legacyMarker = getLegacyMainPaymentMarker(id)
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
          tasks: {
            select: {
              status: true,
              price: true,
              billingState: true,
              id: true,
            },
          },
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
          OR: [
            { notes: { contains: marker } },
            { notes: { contains: legacyMarker } },
          ],
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

      const baseBudget = Number(project.budget?.toString() ?? 0)
      const readyToBillTasks = project.tasks.filter((task) => task.status === 'DONE' && !!task.price && task.billingState !== 'BILLED')
      const completedExtras = readyToBillTasks.reduce((sum, task) => {
        if (!task.price) return sum
        return sum + Number(task.price.toString())
      }, 0)
      const totalCollectible = baseBudget + completedExtras

      const createdPayment = await tx.payment.create({
        data: {
          clientId: project.clientId,
          projectId: project.id,
          amount: totalCollectible,
          category: project.category,
          status: 'PAID',
          paymentMethod: DEFAULT_PAYMENT_METHOD,
          paidAt: today,
          notes: `${marker} ${project.name} proje ödemesi tamamlandı (Ana Bütçe: ${baseBudget}, Tamamlanan Ek İşler: ${completedExtras})`,
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

      if (readyToBillTasks.length > 0) {
        await tx.task.updateMany({
          where: {
            id: {
              in: readyToBillTasks.map((task) => task.id),
            },
          },
          data: {
            billingState: 'BILLED',
          },
        })
      }

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

