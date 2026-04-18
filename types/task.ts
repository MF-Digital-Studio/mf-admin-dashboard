import type { PriorityLevel } from './common'

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done' | 'Blocked'

export interface Task {
  id: string
  title: string
  project: string
  projectId: string
  assignedTo: string
  priority: PriorityLevel
  status: TaskStatus
  price?: number | null
  dueDate: string
  notes?: string
}
