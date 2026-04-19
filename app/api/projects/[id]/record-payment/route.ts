import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaPaymentToPayment } from '@/features/finance/mappers'
import { createCrudNotification } from '@/lib/notifications'
import { getMainPaymentMarker, getLegacyMainPaymentMarker } from '@/lib/project-billing'

interface Params {
    params: Promise<{ id: string }>
}

const DEFAULT_PAYMENT_METHOD = 'Banka Havalesi'

export async function POST(_: Request, { params }: Params) {
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
                            id: true,
                            status: true,
                            price: true,
                            billingState: true,
                        },
                    },
                    payments: {
                        where: {
                            status: 'PAID',
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        select: {
                            id: true,
                            notes: true,
                            amount: true,
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

            const baseBudget = Number(project.budget?.toString() ?? 0)

            // Get all completed priced subtasks (regardless of billing state)
            const allCompletedPriced = project.tasks.filter(
                (task) => task.status === 'DONE' && !!task.price
            )

            const totalCompletedPricedAmount = allCompletedPriced.reduce((sum, task) => {
                if (!task.price) return sum
                return sum + Number(task.price.toString())
            }, 0)

            // What the payment SHOULD be: base + all completed priced
            const correctPaymentAmount = baseBudget + totalCompletedPricedAmount

            // Check if project already has a main payment record
            const existingMainPayment = project.payments.find(
                (p) => p.notes?.includes(marker) || p.notes?.includes(legacyMarker)
            )

            if (existingMainPayment) {
                // UPDATE case: use payment amount as source of truth
                const currentPaymentAmount = Number(existingMainPayment.amount.toString())

                if (currentPaymentAmount === correctPaymentAmount) {
                    // Payment is already correct, ensure all completed priced tasks are marked BILLED
                    const tasksToMarkBilled = allCompletedPriced.filter((t) => t.billingState !== 'BILLED')

                    if (tasksToMarkBilled.length > 0) {
                        await tx.task.updateMany({
                            where: {
                                id: {
                                    in: tasksToMarkBilled.map((task) => task.id),
                                },
                            },
                            data: {
                                billingState: 'BILLED',
                            },
                        })
                    }

                    return {
                        type: 'no_change' as const,
                        payment: existingMainPayment,
                        newBillableAmount: 0,
                    }
                }

                // Payment amount is incorrect, update it
                // Update the payment record FIRST
                const updatedPayment = await tx.payment.update({
                    where: { id: existingMainPayment.id },
                    data: {
                        amount: correctPaymentAmount,
                        notes: `${marker} ${project.name} proje ödemesi güncellendi (Ana Bütçe: ${baseBudget}, Tamamlanan Ek İşler: ${totalCompletedPricedAmount})`,
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

                // THEN mark all completed priced tasks as BILLED (after successful payment update)
                if (allCompletedPriced.length > 0) {
                    await tx.task.updateMany({
                        where: {
                            id: {
                                in: allCompletedPriced.map((task) => task.id),
                            },
                        },
                        data: {
                            billingState: 'BILLED',
                        },
                    })
                }

                const newBillableAmount = correctPaymentAmount - currentPaymentAmount
                const tasksMarkedBilled = allCompletedPriced.filter((t) => t.billingState !== 'BILLED').length

                return {
                    type: 'updated' as const,
                    payment: updatedPayment,
                    projectName: project.name,
                    newBillableAmount: newBillableAmount,
                    billedTaskCount: tasksMarkedBilled,
                }
            }

            // CREATE case: new payment with base budget + all currently completed priced
            const totalCollectible = baseBudget + totalCompletedPricedAmount

            const createdPayment = await tx.payment.create({
                data: {
                    clientId: project.clientId,
                    projectId: project.id,
                    amount: totalCollectible,
                    category: project.category,
                    status: 'PAID',
                    paymentMethod: DEFAULT_PAYMENT_METHOD,
                    paidAt: today,
                    notes: `${marker} ${project.name} proje ödemesi tamamlandı (Ana Bütçe: ${baseBudget}, Tamamlanan Ek İşler: ${totalCompletedPricedAmount})`,
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

            // THEN mark all completed priced tasks as BILLED (after successful payment creation)
            if (allCompletedPriced.length > 0) {
                await tx.task.updateMany({
                    where: {
                        id: {
                            in: allCompletedPriced.map((task) => task.id),
                        },
                    },
                    data: {
                        billingState: 'BILLED',
                    },
                })
            }

            return {
                type: 'created' as const,
                payment: createdPayment,
                projectName: project.name,
                billedTaskCount: allCompletedPriced.length,
            }
        })

        if (result.type === 'not_found') {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 })
        }

        if (result.type === 'no_change') {
            return NextResponse.json({
                recordType: 'no_change',
                payment: result.payment,
            })
        }

        const isCreated = result.type === 'created'
        const notification = `${result.projectName} ${isCreated ? 'proje ödemesi tamamlandı' : 'proje ödemesi güncellendi'
            }${result.billedTaskCount > 0 ? ` (${result.billedTaskCount} alt görev)` : ''}`

        await createCrudNotification({
            action: isCreated ? 'created' : 'updated',
            entityType: 'PAYMENT',
            entityId: result.payment.id,
            entityLabel: 'Ödeme',
            detail: notification,
        }).catch(() => undefined)

        return NextResponse.json({
            recordType: result.type, // 'created' or 'updated'
            payment: mapPrismaPaymentToPayment(result.payment),
            newBillableAmount: result.type === 'updated' ? result.newBillableAmount : undefined,
            billedTaskCount: result.billedTaskCount,
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return NextResponse.json({ message: 'Project or client not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Failed to record payment' }, { status: 500 })
    }
}
