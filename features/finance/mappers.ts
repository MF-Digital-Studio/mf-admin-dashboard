import type { Payment as PrismaPaymentModel, PaymentStatus as PrismaPaymentStatus, ServiceType } from '@prisma/client'
import type { Payment, PaymentStatus, ServiceName } from '@/types'

const paymentStatusToUi: Record<PrismaPaymentStatus, PaymentStatus> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
}

const paymentStatusToPrisma: Record<PaymentStatus, PrismaPaymentStatus> = {
  Paid: 'PAID',
  Pending: 'PENDING',
  Overdue: 'OVERDUE',
}

const categoryToUi: Record<ServiceType, ServiceName> = {
  WEB_DESIGN: 'Web Design',
  SEO: 'SEO',
  QR_MENU: 'QR Menu',
  E_COMMERCE: 'E-commerce',
}

const categoryToPrisma: Record<ServiceName, ServiceType> = {
  'Web Design': 'WEB_DESIGN',
  SEO: 'SEO',
  'QR Menu': 'QR_MENU',
  'E-commerce': 'E_COMMERCE',
}

function toDateString(value: Date | null | undefined): string {
  if (!value) {
    return '-'
  }

  return value.toISOString().slice(0, 10)
}

export function mapPaymentStatusToPrisma(value: PaymentStatus): PrismaPaymentStatus {
  return paymentStatusToPrisma[value]
}

export function mapPaymentCategoryToPrisma(value: ServiceName): ServiceType {
  return categoryToPrisma[value]
}

export function mapPrismaPaymentToPayment(
  payment: PrismaPaymentModel & { client: { id: string; companyName: string }; project: { id: string; name: string } | null }
): Payment {
  return {
    id: payment.id,
    client: payment.client.companyName,
    clientId: payment.clientId,
    project: payment.project?.name ?? null,
    projectId: payment.projectId,
    amount: Number(payment.amount.toString()),
    date: toDateString(payment.paidAt ?? payment.createdAt),
    category: categoryToUi[payment.category],
    status: paymentStatusToUi[payment.status],
    method: payment.paymentMethod,
    notes: payment.notes ?? '',
  }
}

export function mapPrismaPaymentToEditable(payment: PrismaPaymentModel) {
  return {
    clientId: payment.clientId,
    projectId: payment.projectId ?? '',
    amount: Number(payment.amount.toString()),
    date: toDateString(payment.paidAt ?? payment.createdAt),
    category: categoryToUi[payment.category],
    status: paymentStatusToUi[payment.status],
    method: payment.paymentMethod,
    notes: payment.notes ?? '',
  }
}
