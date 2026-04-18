export type SubscriptionBillingCycle = 'Monthly' | 'Quarterly' | 'Yearly'

export interface CompanySubscription {
  id: string
  name: string
  category: string
  billingCycle: SubscriptionBillingCycle
  amount: number
  renewalDate: string
  isActive: boolean
  notes?: string
}
