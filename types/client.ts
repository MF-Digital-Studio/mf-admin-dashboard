import type { ServiceName } from './common'

export type ClientStatus = 'Lead' | 'In Discussion' | 'Active' | 'Completed' | 'Inactive' | 'Urgent'

export interface Client {
  id: string
  company: string
  contact: string
  email?: string
  phone: string
  instagram?: string
  whatsapp?: string
  website?: string
  services: ServiceName[]
  status: ClientStatus
  activeProjects: number
  totalPaid: number
  lastContact: string
  createdAt?: string
  tags: ServiceName[]
  notes: string
  location: string
  category?: string
}
