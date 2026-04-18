import type { Priority, Project as PrismaProjectModel, ProjectStatus, ServiceType } from '@prisma/client'
import type { Project, PriorityLevel, ServiceName } from '@/types'

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

const statusToUi: Record<ProjectStatus, Project['status']> = {
  PLANNING: 'Planning',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  REVISION: 'Revision',
  WAITING_FOR_CLIENT: 'Waiting for Client',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

const statusToPrisma: Record<Project['status'], ProjectStatus> = {
  Planning: 'PLANNING',
  Design: 'DESIGN',
  Development: 'DEVELOPMENT',
  Revision: 'REVISION',
  'Waiting for Client': 'WAITING_FOR_CLIENT',
  'On Hold': 'ON_HOLD',
  Completed: 'COMPLETED',
}

const priorityToUi: Record<Priority, PriorityLevel> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const priorityToPrisma: Record<PriorityLevel, Priority> = {
  High: 'HIGH',
  Medium: 'MEDIUM',
  Low: 'LOW',
}

function toDateString(value: Date | null | undefined): string {
  if (!value) {
    return '-'
  }

  return value.toISOString().slice(0, 10)
}

export function mapProjectServiceToPrisma(value: ServiceName): ServiceType {
  return serviceToPrisma[value]
}

export function mapProjectStatusToPrisma(value: Project['status']): ProjectStatus {
  return statusToPrisma[value]
}

export function mapProjectPriorityToPrisma(value: PriorityLevel): Priority {
  return priorityToPrisma[value]
}

export function mapPrismaProjectToProject(
  project: PrismaProjectModel & { client: { id: string; companyName: string } }
): Project {
  return {
    id: project.id,
    name: project.name,
    client: project.client.companyName,
    clientId: project.clientId,
    service: serviceToUi[project.category],
    startDate: toDateString(project.startDate),
    deadline: toDateString(project.deadline),
    budget: Number(project.budget?.toString() ?? 0),
    status: statusToUi[project.status],
    priority: priorityToUi[project.priority],
    progress: project.progress,
    description: project.notes ?? '',
  }
}

export function mapPrismaProjectToEditable(project: PrismaProjectModel) {
  return {
    name: project.name,
    clientId: project.clientId,
    service: serviceToUi[project.category],
    status: statusToUi[project.status],
    priority: priorityToUi[project.priority],
    budget: Number(project.budget?.toString() ?? 0),
    startDate: toDateString(project.startDate),
    deadline: toDateString(project.deadline),
    progress: project.progress,
    description: project.notes ?? '',
  }
}
