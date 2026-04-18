import type { ServiceName } from './common'

export type ClientStatus = 'Lead' | 'In Discussion' | 'Active' | 'Completed' | 'Inactive'

export interface Client {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  instagram?: string
  services: ServiceName[]
  status: ClientStatus
  activeProjects: number
  totalPaid: number
  lastContact: string
  tags: ServiceName[]
  notes: string
  location: string
}
