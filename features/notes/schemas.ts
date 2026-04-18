import { z } from 'zod'

export const noteCategories = ['Client Notes', 'Meeting Notes', 'Internal Ideas', 'Revision Requests'] as const
export const noteRelatedTypes = ['client', 'project', 'internal'] as const

export const notePayloadSchema = z
  .object({
    title: z.string().trim().min(2, 'Title is required').max(200),
    category: z.enum(noteCategories),
    relatedType: z.enum(noteRelatedTypes),
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
    content: z.string().trim().min(2, 'Content is required').max(10000),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  })
  .superRefine((value, ctx) => {
    if (value.relatedType === 'client' && !value.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'Client is required',
      })
    }

    if (value.relatedType === 'project' && !value.projectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['projectId'],
        message: 'Project is required',
      })
    }
  })

export type NotePayload = z.infer<typeof notePayloadSchema>
