import { z } from 'zod'

export const proposalStatuses = ['Draft', 'Sent', 'Under Review', 'Accepted', 'Rejected'] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine((value) => value === null || datePattern.test(value), 'Invalid date')

export const proposalPayloadSchema = z.object({
  title: z.string().trim().min(2, 'Proposal title is required').max(200),
  clientId: z.string().trim().min(1, 'Client is required'),
  amount: z.coerce.number().min(0, 'Amount must be >= 0'),
  sentDate: optionalDateString,
  status: z.enum(proposalStatuses),
  followUp: optionalDateString,
  notes: z.string().trim().max(3000).optional().default(''),
})

export type ProposalPayload = z.infer<typeof proposalPayloadSchema>
