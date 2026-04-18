export type ActivityType = 'payment' | 'task' | 'proposal' | 'client' | 'project' | 'note'

export interface MonthlyRevenuePoint {
  month: string
  revenue: number
  expenses: number
}

export interface ExpenseBreakdownItem {
  name: string
  value: number
}

export interface ActivityItem {
  id: string
  action: string
  detail: string
  time: string
  type: ActivityType
}
