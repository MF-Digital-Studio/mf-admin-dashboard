import type { ServiceName } from './common'

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue'

export interface Payment {
  id: string
  client: string
  clientId: string
  project?: string | null
  projectId?: string | null
  amount: number
  date: string
  category: ServiceName
  status: PaymentStatus
  method: string
  notes?: string
}

export interface Expense {
  id: string
  name: string
  category: string
  amount: number
  date: string
}
