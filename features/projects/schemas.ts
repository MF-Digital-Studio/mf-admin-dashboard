import { z } from 'zod'

export const projectServices = ['Web Design', 'SEO', 'QR Menu', 'E-commerce'] as const
export const projectStatuses = ['Planning', 'Design', 'Development', 'Revision', 'Waiting for Client', 'On Hold', 'Completed'] as const
export const projectPriorities = ['High', 'Medium', 'Low'] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const projectPayloadSchema = z.object({
  name: z.string().trim().min(2, 'Project name is required').max(160),
  clientId: z.string().trim().min(1, 'Client is required'),
  service: z.enum(projectServices),
  status: z.enum(projectStatuses),
  priority: z.enum(projectPriorities),
  budget: z.coerce.number().min(0, 'Budget must be >= 0'),
  startDate: z.string().trim().regex(datePattern, 'Start date is required'),
  deadline: z.string().trim().regex(datePattern, 'Deadline is required'),
  description: z.string().trim().max(4000).optional().default(''),
})

export type ProjectPayload = z.infer<typeof projectPayloadSchema>
