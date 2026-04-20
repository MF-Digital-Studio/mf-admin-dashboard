import { z } from 'zod'

export const serviceNames = ['Web Design', 'SEO', 'QR Menu', 'E-commerce'] as const
export const clientStatuses = ['Lead', 'In Discussion', 'Active', 'Completed', 'Inactive'] as const

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined
    if (value.length === 0) return null
    return value
  })
  .refine((value) => value === undefined || value === null || z.string().email().safeParse(value).success, 'Invalid email')

export const clientPayloadSchema = z.object({
  company: z.string().trim().min(2, 'Company is required').max(120),
  contact: z.string().trim().min(2, 'Contact is required').max(120),
  email: optionalEmailSchema,
  phone: z.string().trim().min(7, 'Phone is required').max(30),
  location: z.string().trim().max(160).optional(),
  category: z.string().trim().max(120).optional(),
  instagram: z.string().trim().max(250).optional(),
  whatsapp: z.string().trim().max(250).optional(),
  website: z.string().trim().max(250).optional(),
  service: z.enum(serviceNames),
  status: z.enum(clientStatuses),
  notes: z.string().trim().max(2000).optional(),
})

export type ClientPayload = z.infer<typeof clientPayloadSchema>
