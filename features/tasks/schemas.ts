import { z } from 'zod'

export const taskPriorities = ['High', 'Medium', 'Low'] as const
export const taskStatuses = ['Todo', 'In Progress', 'Review', 'Done', 'Blocked'] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const taskPayloadSchema = z.object({
  title: z.string().trim().min(2, 'Task title is required').max(200),
  projectId: z.string().trim().min(1, 'Project is required'),
  assignedTo: z.string().trim().min(1, 'Assignee is required').max(120),
  priority: z.enum(taskPriorities),
  status: z.enum(taskStatuses),
  price: z.union([z.coerce.number().min(0, 'Price must be >= 0'), z.null()]).optional(),
  dueDate: z.string().trim().regex(datePattern, 'Due date is required'),
  notes: z.string().trim().max(3000).optional().default(''),
})

export type TaskPayload = z.infer<typeof taskPayloadSchema>
