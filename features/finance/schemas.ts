import { z } from 'zod'

export const paymentStatuses = ['Paid', 'Pending', 'Overdue'] as const
export const paymentCategories = ['Web Design', 'SEO', 'QR Menu', 'E-commerce'] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const paymentPayloadSchema = z.object({
  clientId: z.string().trim().min(1, 'Client is required'),
  projectId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  amount: z.coerce.number().min(0, 'Amount must be >= 0'),
  date: z.string().trim().regex(datePattern, 'Date is required'),
  category: z.enum(paymentCategories),
  status: z.enum(paymentStatuses),
  method: z.string().trim().min(2, 'Payment method is required').max(120),
  notes: z.string().trim().max(3000).optional().default(''),
})

export type PaymentPayload = z.infer<typeof paymentPayloadSchema>
