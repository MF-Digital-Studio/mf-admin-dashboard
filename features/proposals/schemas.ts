import { z } from 'zod'

export const proposalStatuses = ['Draft', 'Sent', 'Under Review', 'Accepted', 'Rejected'] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine((value) => value === null || datePattern.test(value), 'Invalid date')

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))

const proposalBaseSchema = z.object({
  title: z.string().trim().min(2, 'Proposal title is required').max(200),
  clientMode: z.enum(['existing', 'new']).default('existing'),
  clientId: optionalText,
  newClientCompany: optionalText,
  newClientContact: optionalText,
  newClientEmail: optionalText,
  newClientPhone: optionalText,
  newClientInstagram: optionalText,
  amount: z.coerce.number().min(0, 'Amount must be >= 0'),
  sentDate: optionalDateString,
  status: z.enum(proposalStatuses),
  followUp: optionalDateString,
  notes: z.string().trim().max(3000).optional().default(''),
})

export const proposalPayloadSchema = proposalBaseSchema.superRefine((value, ctx) => {
  if (value.clientMode === 'existing') {
    if (!value.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'Client is required',
      })
    }
    return
  }

  if (!value.newClientCompany) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newClientCompany'], message: 'Company is required' })
  }
  if (!value.newClientContact) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newClientContact'], message: 'Contact is required' })
  }
  if (!value.newClientEmail) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newClientEmail'], message: 'Email is required' })
  } else if (!z.string().email().safeParse(value.newClientEmail).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newClientEmail'], message: 'Invalid email' })
  }
  if (!value.newClientPhone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newClientPhone'], message: 'Phone is required' })
  }
})

export const proposalPatchPayloadSchema = proposalBaseSchema.partial()

export type ProposalPayload = z.infer<typeof proposalPayloadSchema>
