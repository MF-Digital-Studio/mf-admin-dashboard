import type { Priority, Task as PrismaTaskModel, TaskStatus as PrismaTaskStatus } from '@prisma/client'
import type { PriorityLevel, Task, TaskStatus } from '@/types'

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

const statusToUi: Record<PrismaTaskStatus, TaskStatus> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
}

const statusToPrisma: Record<TaskStatus, PrismaTaskStatus> = {
  Todo: 'TODO',
  'In Progress': 'IN_PROGRESS',
  Review: 'REVIEW',
  Done: 'DONE',
  Blocked: 'BLOCKED',
}

function toDateString(value: Date | null | undefined): string {
  if (!value) {
    return '-'
  }

  return value.toISOString().slice(0, 10)
}

export function mapTaskPriorityToPrisma(value: PriorityLevel): Priority {
  return priorityToPrisma[value]
}

export function mapTaskStatusToPrisma(value: TaskStatus): PrismaTaskStatus {
  return statusToPrisma[value]
}

export function mapPrismaTaskToTask(task: PrismaTaskModel & { project: { id: string; name: string } }): Task {
  return {
    id: task.id,
    title: task.title,
    project: task.project.name,
    projectId: task.projectId,
    assignedTo: task.assignee,
    priority: priorityToUi[task.priority],
    status: statusToUi[task.status],
    dueDate: toDateString(task.dueDate),
    notes: task.notes ?? '',
  }
}

export function mapPrismaTaskToEditable(task: PrismaTaskModel) {
  return {
    title: task.title,
    projectId: task.projectId,
    assignedTo: task.assignee,
    priority: priorityToUi[task.priority],
    status: statusToUi[task.status],
    dueDate: toDateString(task.dueDate),
    notes: task.notes ?? '',
  }
}
