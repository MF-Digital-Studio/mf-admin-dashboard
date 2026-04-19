import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaSubscriptionToEditable, mapPrismaSubscriptionToSubscription, mapSubscriptionCycleToPrisma } from '@/features/finance/subscription-mappers'
import { subscriptionPayloadSchema } from '@/features/finance/subscription-schemas'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const subscription = await prisma.companySubscription.findUnique({
    where: { id },
  })

  if (!subscription) {
    return NextResponse.json({ message: 'Subscription not found' }, { status: 404 })
  }

  return NextResponse.json({
    subscription: mapPrismaSubscriptionToSubscription(subscription),
    editable: mapPrismaSubscriptionToEditable(subscription),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  const body = await request.json()
  const parsed = subscriptionPayloadSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'At least one field is required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) data.name = parsed.data.name
  if (parsed.data.category !== undefined) data.category = parsed.data.category
  if (parsed.data.billingCycle !== undefined) data.billingCycle = mapSubscriptionCycleToPrisma(parsed.data.billingCycle)
  if (parsed.data.amount !== undefined) data.amount = parsed.data.amount
  if (parsed.data.renewalDate !== undefined) data.renewalDate = new Date(parsed.data.renewalDate)
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null

  try {
    const updated = await prisma.companySubscription.update({
      where: { id },
      data,
    })
    return NextResponse.json(mapPrismaSubscriptionToSubscription(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Failed to update subscription' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params

  try {
    await prisma.companySubscription.delete({
      where: { id },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Failed to delete subscription' }, { status: 500 })
  }
}

