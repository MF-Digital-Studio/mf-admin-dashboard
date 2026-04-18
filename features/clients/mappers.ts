import type { Client as PrismaClientModel, ClientStatus, PaymentStatus, ProjectStatus, ServiceType } from '@prisma/client'
import type { Client, Payment, Project, ServiceName } from '@/types'

const serviceToUi: Record<ServiceType, ServiceName> = {
  WEB_DESIGN: 'Web Design',
  SEO: 'SEO',
  QR_MENU: 'QR Menu',
  E_COMMERCE: 'E-commerce',
}

const serviceToPrisma: Record<ServiceName, ServiceType> = {
  'Web Design': 'WEB_DESIGN',
  SEO: 'SEO',
  'QR Menu': 'QR_MENU',
  'E-commerce': 'E_COMMERCE',
}

const statusToUi: Record<ClientStatus, Client['status']> = {
  LEAD: 'Lead',
  IN_DISCUSSION: 'In Discussion',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  INACTIVE: 'Inactive',
}

const statusToPrisma: Record<Client['status'], ClientStatus> = {
  Lead: 'LEAD',
  'In Discussion': 'IN_DISCUSSION',
  Active: 'ACTIVE',
  Completed: 'COMPLETED',
  Inactive: 'INACTIVE',
}

const projectStatusToUi: Record<ProjectStatus, Project['status']> = {
  PLANNING: 'Planning',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  REVISION: 'Revision',
  WAITING_FOR_CLIENT: 'Waiting for Client',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

const paymentStatusToUi: Record<PaymentStatus, Payment['status']> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
}

function toDateString(value: Date | null | undefined): string {
  if (!value) {
    return '-'
  }

  return value.toISOString().slice(0, 10)
}

export function mapServiceToPrisma(value: ServiceName): ServiceType {
  return serviceToPrisma[value]
}

export function mapStatusToPrisma(value: Client['status']): ClientStatus {
  return statusToPrisma[value]
}

export function mapPrismaClientToClientSummary(
  client: PrismaClientModel & { projects: Array<{ status: ProjectStatus }>; payments: Array<{ amount: { toString(): string }; paidAt: Date | null; createdAt: Date }> }
): Client {
  const totalPaid = client.payments.reduce((sum, payment) => sum + Number(payment.amount.toString()), 0)
  const activeProjects = client.projects.filter((project) => project.status !== 'COMPLETED').length
  const latestPaymentDate = client.payments
    .map((payment) => payment.paidAt ?? payment.createdAt)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const service = serviceToUi[client.serviceType]

  return {
    id: client.id,
    company: client.companyName,
    contact: client.contactPerson,
    email: client.email,
    phone: client.phone,
    services: [service],
    status: statusToUi[client.status],
    activeProjects,
    totalPaid,
    lastContact: toDateString(latestPaymentDate ?? client.updatedAt),
    tags: [service],
    notes: client.notes ?? '',
    location: '-',
  }
}

export function mapPrismaProjectToClientDetail(project: {
  id: string
  name: string
  status: ProjectStatus
  progress: number
}): Pick<Project, 'id' | 'name' | 'status' | 'progress'> {
  return {
    id: project.id,
    name: project.name,
    status: projectStatusToUi[project.status],
    progress: project.progress,
  }
}

export function mapPrismaPaymentToClientDetail(payment: {
  id: string
  amount: { toString(): string }
  status: PaymentStatus
  paidAt: Date | null
  createdAt: Date
}): Pick<Payment, 'id' | 'amount' | 'status' | 'date'> {
  return {
    id: payment.id,
    amount: Number(payment.amount.toString()),
    status: paymentStatusToUi[payment.status],
    date: toDateString(payment.paidAt ?? payment.createdAt),
  }
}

export function mapPrismaClientToEditable(client: PrismaClientModel) {
  return {
    company: client.companyName,
    contact: client.contactPerson,
    email: client.email,
    phone: client.phone,
    service: serviceToUi[client.serviceType],
    status: statusToUi[client.status],
    notes: client.notes ?? '',
  }
}

