import type { ServiceName } from './common'

export type ServiceColor = 'blue' | 'green' | 'orange' | 'purple' | 'cyan'
export type ServiceIcon = 'Globe' | 'TrendingUp' | 'QrCode' | 'ShoppingBag' | 'Shield'

export interface Service {
  id: string
  name: string
  icon: ServiceIcon
  description: string
  startingPrice: number
  currency: string
  delivery: string
  includes: string[]
  addons: string[]
  color: ServiceColor
}
