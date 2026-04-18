import type { PriorityLevel, ServiceName } from './common'

export type ProjectStatus = 'Planning' | 'Design' | 'Development' | 'Revision' | 'Waiting for Client' | 'On Hold' | 'Completed'

export interface Project {
  id: string
  name: string
  client: string
  clientId: string
  service: ServiceName
  startDate: string
  deadline: string
  budget: number
  status: ProjectStatus
  priority: PriorityLevel
  taskCount: number
  completedTaskCount: number
  description: string
}
