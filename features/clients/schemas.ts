import { z } from 'zod'

export const serviceNames = ['Web Design', 'SEO', 'QR Menu', 'E-commerce'] as const
export const clientStatuses = ['Lead', 'In Discussion', 'Active', 'Completed', 'Inactive'] as const

export const clientPayloadSchema = z.object({
  company: z.string().trim().min(2, 'Company is required').max(120),
  contact: z.string().trim().min(2, 'Contact is required').max(120),
  email: z.string().trim().email('Invalid email'),
  phone: z.string().trim().min(7, 'Phone is required').max(30),
  service: z.enum(serviceNames),
  status: z.enum(clientStatuses),
  notes: z.string().trim().max(2000).optional().default(''),
})

export type ClientPayload = z.infer<typeof clientPayloadSchema>
