export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue'

export interface Payment {
  id: string
  client: string
  amount: number
  date: string
  category: string
  status: PaymentStatus
  method: string
}

export interface Expense {
  id: string
  name: string
  category: string
  amount: number
  date: string
}

