import { type Notification as PrismaNotification, NotificationEntityType, NotificationEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { ActivityItem } from '@/types'

const CRUD_EVENT_TO_NOTIFICATION: Record<'created' | 'updated' | 'deleted', NotificationEventType> = {
  created: 'CREATED',
  updated: 'UPDATED',
  deleted: 'DELETED',
}

const CRUD_EVENT_TEXT: Record<'created' | 'updated' | 'deleted', string> = {
  created: 'olu\u015fturuldu',
  updated: 'g\u00fcncellendi',
  deleted: 'silindi',
}

const ACTIVITY_TYPE_MAP: Record<NotificationEntityType, ActivityItem['type']> = {
  CLIENT: 'client',
  PROJECT: 'project',
  TASK: 'task',
  PROPOSAL: 'proposal',
  PAYMENT: 'payment',
  NOTE: 'note',
  SYSTEM: 'task',
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${Math.max(1, minutes)} dk \u00f6nce`
  }

  if (hours < 24) {
    return `${hours} saat \u00f6nce`
  }

  return `${days} g\u00fcn \u00f6nce`
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10)
}

interface NotificationActivityRow {
  id: string
  title: string
  message: string
  entityType: NotificationEntityType
  createdAt: Date
}

export interface CreateNotificationInput {
  title: string
  message: string
  eventType: NotificationEventType
  entityType: NotificationEntityType
  entityId?: string | null
  dedupeKey?: string
}

export async function createNotification(input: CreateNotificationInput): Promise<PrismaNotification | null> {
  try {
    if (input.dedupeKey) {
      return await prisma.notification.upsert({
        where: {
          dedupeKey: input.dedupeKey,
        },
        update: {
          title: input.title,
          message: input.message,
        },
        create: {
          title: input.title,
          message: input.message,
          eventType: input.eventType,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          dedupeKey: input.dedupeKey,
        },
      })
    }

    return await prisma.notification.create({
      data: {
        title: input.title,
        message: input.message,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
      },
    })
  } catch {
    return null
  }
}

export async function createCrudNotification(args: {
  action: 'created' | 'updated' | 'deleted'
  entityType: NotificationEntityType
  entityId?: string | null
  entityLabel: string
  detail?: string
}) {
  const actionText = CRUD_EVENT_TEXT[args.action]

  return createNotification({
    title: `${args.entityLabel} ${actionText}`,
    message: args.detail ? args.detail : `${args.entityLabel} kayd\u0131 ${actionText}`,
    eventType: CRUD_EVENT_TO_NOTIFICATION[args.action],
    entityType: args.entityType,
    entityId: args.entityId ?? null,
  })
}

export function mapNotificationToActivityItem(notification: NotificationActivityRow): ActivityItem {
  return {
    id: notification.id,
    action: notification.title,
    detail: notification.message,
    time: formatRelativeTime(notification.createdAt),
    type: ACTIVITY_TYPE_MAP[notification.entityType],
  }
}

export async function listRecentNotifications(limit = 6) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        hiddenFromBell: false,
      },
      select: {
        id: true,
        title: true,
        message: true,
        eventType: true,
        entityType: true,
        entityId: true,
        read: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      eventType: notification.eventType,
      entityType: notification.entityType,
      entityId: notification.entityId,
      read: Boolean(notification.read),
      createdAt: notification.createdAt.toISOString(),
      time: formatRelativeTime(notification.createdAt),
    }))
  } catch {
    try {
      const notifications = await prisma.notification.findMany({
        select: {
          id: true,
          title: true,
          message: true,
          eventType: true,
          entityType: true,
          entityId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        eventType: notification.eventType,
        entityType: notification.entityType,
        entityId: notification.entityId,
        read: false,
        createdAt: notification.createdAt.toISOString(),
        time: formatRelativeTime(notification.createdAt),
      }))
    } catch {
      return []
    }
  }
}

export async function clearBellNotifications() {
  try {
    return await prisma.notification.updateMany({
      where: {
        hiddenFromBell: false,
      },
      data: {
        hiddenFromBell: true,
      },
    })
  } catch {
    return { count: 0 }
  }
}

export async function listRecentActivities(limit = 6) {
  try {
    const notifications = await prisma.notification.findMany({
      select: {
        id: true,
        title: true,
        message: true,
        entityType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return notifications.map(mapNotificationToActivityItem)
  } catch {
    return []
  }
}

export async function markNotificationRead(id: string) {
  try {
    return await prisma.notification.update({
      where: { id },
      data: { read: true },
    })
  } catch {
    return null
  }
}

export async function markAllNotificationsRead() {
  try {
    return await prisma.notification.updateMany({
      where: {
        read: false,
      },
      data: {
        read: true,
      },
    })
  } catch {
    return { count: 0 }
  }
}

export async function ensureSystemNotifications() {
  try {
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dueSoonBoundary = new Date(today)
    dueSoonBoundary.setUTCDate(dueSoonBoundary.getUTCDate() + 3)

    const [tasksDueSoon, overdueTasks, projectsDueSoon, overdueProjects] = await Promise.all([
      prisma.task.findMany({
        where: {
          dueDate: { gte: today, lte: dueSoonBoundary },
          status: { not: 'DONE' },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          project: {
            select: {
              name: true,
            },
          },
        },
        take: 50,
      }),
      prisma.task.findMany({
        where: {
          dueDate: { lt: today },
          status: { not: 'DONE' },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          project: {
            select: {
              name: true,
            },
          },
        },
        take: 50,
      }),
      prisma.project.findMany({
        where: {
          deadline: { gte: today, lte: dueSoonBoundary },
          status: { not: 'COMPLETED' },
        },
        select: {
          id: true,
          name: true,
          deadline: true,
          client: {
            select: {
              companyName: true,
            },
          },
        },
        take: 50,
      }),
      prisma.project.findMany({
        where: {
          deadline: { lt: today },
          status: { not: 'COMPLETED' },
        },
        select: {
          id: true,
          name: true,
          deadline: true,
          client: {
            select: {
              companyName: true,
            },
          },
        },
        take: 50,
      }),
    ])

    const jobs: Promise<unknown>[] = []

    for (const task of tasksDueSoon) {
      if (!task.dueDate) {
        continue
      }

      jobs.push(
        createNotification({
          title: 'Yakla\u015fan g\u00f6rev tarihi',
          message: `${task.title} - ${task.project.name} (${toDateKey(task.dueDate)})`,
          eventType: 'DUE_SOON',
          entityType: 'TASK',
          entityId: task.id,
          dedupeKey: `due_soon:task:${task.id}:${toDateKey(task.dueDate)}`,
        })
      )
    }

    for (const task of overdueTasks) {
      if (!task.dueDate) {
        continue
      }

      jobs.push(
        createNotification({
          title: 'Geciken g\u00f6rev',
          message: `${task.title} - ${task.project.name} (${toDateKey(task.dueDate)})`,
          eventType: 'OVERDUE',
          entityType: 'TASK',
          entityId: task.id,
          dedupeKey: `overdue:task:${task.id}:${toDateKey(task.dueDate)}`,
        })
      )
    }

    for (const project of projectsDueSoon) {
      if (!project.deadline) {
        continue
      }

      jobs.push(
        createNotification({
          title: 'Yakla\u015fan proje teslimi',
          message: `${project.name} - ${project.client.companyName} (${toDateKey(project.deadline)})`,
          eventType: 'DUE_SOON',
          entityType: 'PROJECT',
          entityId: project.id,
          dedupeKey: `due_soon:project:${project.id}:${toDateKey(project.deadline)}`,
        })
      )
    }

    for (const project of overdueProjects) {
      if (!project.deadline) {
        continue
      }

      jobs.push(
        createNotification({
          title: 'Geciken proje teslimi',
          message: `${project.name} - ${project.client.companyName} (${toDateKey(project.deadline)})`,
          eventType: 'OVERDUE',
          entityType: 'PROJECT',
          entityId: project.id,
          dedupeKey: `overdue:project:${project.id}:${toDateKey(project.deadline)}`,
        })
      )
    }

    await Promise.all(jobs)
  } catch {
    return
  }
}
