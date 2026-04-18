import { NextResponse } from 'next/server'
import { ensureSystemNotifications, listRecentActivities } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import type { MonthlyRevenuePoint } from '@/types'

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date)
}

export async function GET() {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const soonBoundary = new Date(today)
  soonBoundary.setUTCDate(soonBoundary.getUTCDate() + 7)

  const [
    activeClients,
    activeProjects,
    overdueTasks,
    tasksDueSoon,
    upcomingDeadlines,
    recentClientsRaw,
    paidPayments,
    pendingPayments,
    pendingProposals,
    projectsForStatus,
    highPriorityOpenTasks,
    weeklyCompletedTasks,
  ] = await prisma.$transaction([
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count({
      where: {
        status: {
          in: ['PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVISION', 'WAITING_FOR_CLIENT'],
        },
      },
    }),
    prisma.task.count({
      where: {
        dueDate: { lt: today },
        status: { not: 'DONE' },
      },
    }),
    prisma.task.count({
      where: {
        dueDate: { gte: today, lte: soonBoundary },
        status: { not: 'DONE' },
      },
    }),
    prisma.project.findMany({
      where: {
        deadline: { gte: today },
        status: { not: 'COMPLETED' },
      },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
      take: 4,
    }),
    prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payments: {
          where: { status: 'PAID' },
          select: { amount: true },
        },
      },
      take: 4,
    }),
    prisma.payment.findMany({
      where: { status: 'PAID' },
      select: {
        amount: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.proposal.count({
      where: {
        status: { in: ['SENT', 'UNDER_REVIEW'] },
      },
    }),
    prisma.project.findMany({
      select: {
        status: true,
      },
    }),
    prisma.task.count({
      where: {
        priority: 'HIGH',
        status: { not: 'DONE' },
      },
    }),
    prisma.task.count({
      where: {
        status: 'DONE',
        updatedAt: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  const revenueByMonth = new Map<string, number>()
  for (const payment of paidPayments) {
    const sourceDate = payment.paidAt ?? payment.createdAt
    const key = monthKey(sourceDate)
    const current = revenueByMonth.get(key) ?? 0
    revenueByMonth.set(key, current + Number(payment.amount.toString()))
  }

  const monthlyRevenue: MonthlyRevenuePoint[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1))
    const key = monthKey(d)
    monthlyRevenue.push({
      month: monthLabel(d),
      revenue: Math.round(revenueByMonth.get(key) ?? 0),
      expenses: 0,
    })
  }

  const projectStatusData = [
    { name: 'Planlama', value: projectsForStatus.filter((p) => p.status === 'PLANNING').length, fill: '#64748b' },
    { name: 'Tasarım', value: projectsForStatus.filter((p) => p.status === 'DESIGN').length, fill: '#a855f7' },
    { name: 'Geliştirme', value: projectsForStatus.filter((p) => p.status === 'DEVELOPMENT').length, fill: '#3b82f6' },
    { name: 'Revizyon', value: projectsForStatus.filter((p) => p.status === 'REVISION').length, fill: '#f97316' },
    { name: 'Bekleyen', value: projectsForStatus.filter((p) => p.status === 'WAITING_FOR_CLIENT').length, fill: '#eab308' },
    { name: 'Tamamlandı', value: projectsForStatus.filter((p) => p.status === 'COMPLETED').length, fill: '#22c55e' },
  ]

  await ensureSystemNotifications()
  const activities = await listRecentActivities(6)

  const recentClients = recentClientsRaw.map((client) => ({
    id: client.id,
    company: client.companyName,
    contact: client.contactPerson,
    status:
      client.status === 'LEAD'
        ? 'Lead'
        : client.status === 'IN_DISCUSSION'
          ? 'In Discussion'
          : client.status === 'ACTIVE'
            ? 'Active'
            : client.status === 'COMPLETED'
              ? 'Completed'
              : 'Inactive',
    totalPaid: client.payments.reduce((sum, p) => sum + Number(p.amount.toString()), 0),
    location: '-',
  }))

  return NextResponse.json({
    activeClients,
    activeProjects,
    overdueTasks,
    tasksDueSoon,
    highPriorityOpenTasks,
    weeklyCompletedTasks,
    pendingPaymentsAmount: Number(pendingPayments._sum.amount?.toString() ?? 0),
    pendingPaymentsCount: pendingPayments._count._all,
    pendingProposals,
    monthlyRevenue,
    projectStatusData,
    upcomingProjectDeadlines: upcomingDeadlines.map((project) => ({
      id: project.id,
      name: project.name,
      client: project.client.companyName,
      deadline: project.deadline ? project.deadline.toISOString().slice(0, 10) : '-',
      status:
        project.status === 'PLANNING'
          ? 'Planning'
          : project.status === 'DESIGN'
            ? 'Design'
            : project.status === 'DEVELOPMENT'
              ? 'Development'
              : project.status === 'REVISION'
                ? 'Revision'
                : project.status === 'WAITING_FOR_CLIENT'
                  ? 'Waiting for Client'
                  : project.status === 'ON_HOLD'
                    ? 'On Hold'
                    : 'Completed',
    })),
    recentClients,
    activities,
  })
}
