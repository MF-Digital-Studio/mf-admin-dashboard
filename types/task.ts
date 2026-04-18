import type { PriorityLevel } from './common'

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done' | 'Blocked'
export type TaskBillingState = 'pending' | 'ready_to_bill' | 'billed'

export interface Task {
  id: string
  title: string
  project: string
  projectId: string
  assignedTo: string
  priority: PriorityLevel
  status: TaskStatus
  billingState?: TaskBillingState
  price?: number | null
  dueDate: string
  notes?: string
}
