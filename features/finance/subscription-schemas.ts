import { z } from 'zod'

export const billingCycles = ['Monthly', 'Quarterly', 'Yearly'] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const subscriptionPayloadSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(160),
  category: z.string().trim().min(2, 'Category is required').max(120),
  billingCycle: z.enum(billingCycles),
  amount: z.coerce.number().min(0, 'Amount must be >= 0'),
  renewalDate: z.string().trim().regex(datePattern, 'Renewal date is required'),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().trim().max(3000).optional().default(''),
})

export type SubscriptionPayload = z.infer<typeof subscriptionPayloadSchema>
