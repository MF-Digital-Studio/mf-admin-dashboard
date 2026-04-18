import type { CompanySubscription as PrismaCompanySubscription, SubscriptionBillingCycle as PrismaSubscriptionBillingCycle } from '@prisma/client'
import type { CompanySubscription, SubscriptionBillingCycle } from '@/types'

const cycleToUi: Record<PrismaSubscriptionBillingCycle, SubscriptionBillingCycle> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
}

const cycleToPrisma: Record<SubscriptionBillingCycle, PrismaSubscriptionBillingCycle> = {
  Monthly: 'MONTHLY',
  Quarterly: 'QUARTERLY',
  Yearly: 'YEARLY',
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function mapSubscriptionCycleToPrisma(value: SubscriptionBillingCycle): PrismaSubscriptionBillingCycle {
  return cycleToPrisma[value]
}

export function mapPrismaSubscriptionToSubscription(subscription: PrismaCompanySubscription): CompanySubscription {
  return {
    id: subscription.id,
    name: subscription.name,
    category: subscription.category,
    billingCycle: cycleToUi[subscription.billingCycle],
    amount: Number(subscription.amount.toString()),
    renewalDate: toDateString(subscription.renewalDate),
    isActive: subscription.isActive,
    notes: subscription.notes ?? '',
  }
}

export function mapPrismaSubscriptionToEditable(subscription: PrismaCompanySubscription) {
  return {
    name: subscription.name,
    category: subscription.category,
    billingCycle: cycleToUi[subscription.billingCycle],
    amount: Number(subscription.amount.toString()),
    renewalDate: toDateString(subscription.renewalDate),
    isActive: subscription.isActive,
    notes: subscription.notes ?? '',
  }
}
