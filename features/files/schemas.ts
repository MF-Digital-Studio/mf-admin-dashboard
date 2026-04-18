import { z } from 'zod'

export const fileCategories = ['Logos', 'Contracts', 'Assets', 'Deliverables', 'Screenshots', 'Documents'] as const

export const fileUploadPayloadSchema = z.object({
  category: z.enum(fileCategories),
  clientId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  projectId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  notes: z.string().trim().max(3000).optional().default(''),
})

export type FileUploadPayload = z.infer<typeof fileUploadPayloadSchema>
