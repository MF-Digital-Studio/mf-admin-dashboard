import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapPrismaSubscriptionToSubscription, mapSubscriptionCycleToPrisma } from '@/features/finance/subscription-mappers'
import { subscriptionPayloadSchema } from '@/features/finance/subscription-schemas'

export async function GET() {
  const subscriptions = await prisma.companySubscription.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(subscriptions.map(mapPrismaSubscriptionToSubscription))
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = subscriptionPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const created = await prisma.companySubscription.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        billingCycle: mapSubscriptionCycleToPrisma(parsed.data.billingCycle),
        amount: parsed.data.amount,
        renewalDate: new Date(parsed.data.renewalDate),
        isActive: parsed.data.isActive,
        notes: parsed.data.notes || null,
      },
    })

    return NextResponse.json(mapPrismaSubscriptionToSubscription(created), { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Failed to create subscription' }, { status: 500 })
  }
}
