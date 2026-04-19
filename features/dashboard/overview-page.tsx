'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Users,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Clock,
  Zap,
  DollarSign,
  Star,
  Target,
  StickyNote,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { StatusBadge } from '@/components/shared/badges'
import { StatCard } from '@/components/shared/stat-card'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { onDashboardDataRefresh } from '@/lib/dashboard-events'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ActivityItem, MonthlyRevenuePoint } from '@/types'

type DashboardOverviewData = {
  activeClients: number
  activeProjects: number
  overdueTasks: number
  tasksDueSoon: number
  highPriorityOpenTasks: number
  weeklyCompletedTasks: number
  pendingPaymentsAmount: number
  pendingPaymentsCount: number
  pendingProposals: number
  monthlyRevenue: MonthlyRevenuePoint[]
  projectStatusData: Array<{ name: string; value: number; fill: string }>
  upcomingProjectDeadlines: Array<{ id: string; name: string; client: string; deadline: string; status: string }>
  recentClients: Array<{ id: string; company: string; contact: string; status: string; totalPaid: number; location: string }>
  activities: ActivityItem[]
}

const activityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  payment: DollarSign,
  task: CheckSquare,
  proposal: FileText,
  client: Users,
  project: FolderKanban,
  note: StickyNote,
}

const fallbackData: DashboardOverviewData = {
  activeClients: 0,
  activeProjects: 0,
  overdueTasks: 0,
  tasksDueSoon: 0,
  highPriorityOpenTasks: 0,
  weeklyCompletedTasks: 0,
  pendingPaymentsAmount: 0,
  pendingPaymentsCount: 0,
  pendingProposals: 0,
  monthlyRevenue: [],
  projectStatusData: [
    { name: 'Planlama', value: 0, fill: '#64748b' },
    { name: 'Tasarım', value: 0, fill: '#a855f7' },
    { name: 'Geliştirme', value: 0, fill: '#3b82f6' },
    { name: 'Revizyon', value: 0, fill: '#f97316' },
    { name: 'Bekleyen', value: 0, fill: '#eab308' },
    { name: 'Tamamlandı', value: 0, fill: '#22c55e' },
  ],
  upcomingProjectDeadlines: [],
  recentClients: [],
  activities: [],
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  return null
}

function formattedTodayLabel(): string {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export function OverviewPage() {
  const [data, setData] = useState<DashboardOverviewData>(fallbackData)
  const [error, setError] = useState<string | null>(null)
  const [currentAdminName, setCurrentAdminName] = useState<string>('')

  const loadDashboard = useCallback(async () => {
    setError(null)
    const response = await fetch('/api/dashboard')
    if (!response.ok) {
      throw new Error('Dashboard verileri alınamadı')
    }
    const json = (await response.json()) as DashboardOverviewData
    setData({
      ...fallbackData,
      ...json,
    })
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        await loadDashboard()
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Dashboard verileri alınamadı')
        }
      }
    }

    const sync = () => {
      void run()
    }

    void run()
    const cleanupRefreshListener = onDashboardDataRefresh(sync)
    const intervalId = window.setInterval(sync, 60000)

    return () => {
      mounted = false
      cleanupRefreshListener()
      window.clearInterval(intervalId)
    }
  }, [loadDashboard])

  useEffect(() => {
    let mounted = true

    const loadCurrentAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login'
          }
          return
        }

        const authData = (await response.json()) as { user?: { name?: string } }
        if (mounted && authData.user?.name) {
          setCurrentAdminName(authData.user.name)
        }
      } catch {
        // auth route is already protected; fail silently here
      }
    }

    void loadCurrentAdmin()

    return () => {
      mounted = false
    }
  }, [])

  const kpiCards = useMemo(
    () => [
      {
        label: 'Bu Ay Gelir',
        value: formatCurrency(data.monthlyRevenue[data.monthlyRevenue.length - 1]?.revenue ?? 0),
        sub: `Geçen ay: ${formatCurrency(data.monthlyRevenue[data.monthlyRevenue.length - 2]?.revenue ?? 0)}`,
        icon: DollarSign,
        trend: 'up',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        subColor: 'text-emerald-400',
      },
      {
        label: 'Bekleyen Ödemeler',
        value: formatCurrency(data.pendingPaymentsAmount),
        sub: `${data.pendingPaymentsCount} ödeme beklemede`,
        icon: AlertCircle,
        trend: 'warn',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        subColor: 'text-yellow-400',
      },
      {
        label: 'Aktif Müşteriler',
        value: String(data.activeClients),
        sub: 'Veritabanından canlı değer',
        icon: Users,
        trend: 'neutral',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        subColor: 'text-muted-foreground',
      },
      {
        label: 'Aktif Projeler',
        value: String(data.activeProjects),
        sub: `${data.upcomingProjectDeadlines.length} yaklaşan teslim`,
        icon: FolderKanban,
        trend: 'neutral',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        subColor: 'text-muted-foreground',
      },
      {
        label: 'Geciken Görevler',
        value: String(data.overdueTasks),
        sub: `${data.tasksDueSoon} görev yakında teslim`,
        icon: CheckSquare,
        trend: 'down',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        subColor: 'text-red-400',
      },
      {
        label: 'Bekleyen Teklifler',
        value: String(data.pendingProposals),
        sub: 'Mevcut veriye göre canlı',
        icon: FileText,
        trend: 'up',
        color: 'text-primary',
        bg: 'bg-primary/10',
        subColor: 'text-primary',
      },
    ],
    [data]
  )

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Merhaba, {currentAdminName || '...'}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Bugün odaklanman gerekenler - {formattedTodayLabel()}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 w-full sm:w-auto">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-primary">{data.highPriorityOpenTasks} yüksek öncelikli iş</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card) => {
          const TrendIcon = card.trend === 'up' || card.trend === 'down' ? ArrowUpRight : undefined

          return (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              subtext={card.sub}
              icon={card.icon}
              iconToneClassName={card.color}
              iconBackgroundClassName={card.bg}
              trendIcon={TrendIcon}
              trendIconClassName={cn(
                card.trend === 'up' && 'text-emerald-400',
                card.trend === 'down' && 'text-red-400 rotate-90',
                card.trend === 'warn' && 'text-yellow-400'
              )}
              subtextClassName={card.subColor}
            />
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Gelir ve Giderler</h3>
              <p className="text-sm text-muted-foreground">Son 7 ay</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Gelir</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Gider</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.20 250)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="oklch(0.65 0.20 250)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.008 264)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 264)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 264)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Gelir" stroke="oklch(0.65 0.20 250)" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="expenses" name="Gider" stroke="#f87171" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-1">Proje Hattı</h3>
          <p className="text-sm text-muted-foreground mb-4">Duruma göre</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={data.projectStatusData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value">
                {data.projectStatusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'oklch(0.13 0.006 264)', border: '1px solid oklch(0.22 0.008 264)', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: 'oklch(0.94 0.005 264)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.projectStatusData.map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.fill }} />
                  <span className="text-sm text-muted-foreground">{status.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            {data.activities.length > 0 ? (
              data.activities.map((activity) => {
                const ActivityIcon = activityIcon[activity.type]
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    {ActivityIcon ? (
                      <ActivityIcon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    ) : (
                      <span className="text-sm mt-0.5 text-muted-foreground shrink-0">•</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">{activity.time}</span>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">Henüz aktivite yok</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">Yaklaşan Teslim Tarihleri</h3>
          <div className="space-y-3">
            {data.upcomingProjectDeadlines.length > 0 ? (
              data.upcomingProjectDeadlines.map((project) => (
                <div key={project.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 border border-border/50 hover:border-border transition-colors">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{project.client}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{project.deadline}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Yaklaşan proje teslimi yok</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">Hızlı İçgörüler</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3 h-3 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Görev Akışı</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{data.tasksDueSoon} görev yakında teslim</p>
              <p className="text-sm text-muted-foreground">{data.weeklyCompletedTasks} görev son 7 günde tamamlandı</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/8 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3 h-3 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Müşteri Durumu</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{data.activeClients} aktif müşteri</p>
              <p className="text-sm text-muted-foreground">{data.activeProjects} aktif proje yönetiliyor</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/8 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-3 h-3 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400 uppercase tracking-wide">Riskte</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{data.overdueTasks} geciken görev</p>
              <p className="text-sm text-muted-foreground">Acil aksiyon gerektiren kayıtlar</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Bu Hafta</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{data.highPriorityOpenTasks} yüksek öncelikli açık görev</p>
              <p className="text-sm text-muted-foreground">{data.upcomingProjectDeadlines.length} yaklaşan proje teslimi var</p>
            </div>
          </div>
        </div>
      </div>

      <TableWrapper title="Son Müşteriler" description="Aktif ve güncel" action={<span className="text-sm text-muted-foreground">{data.recentClients.length} kayıt</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Şirket</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">İletişim</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Durum</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Toplam Ödeme</th>
              </tr>
            </thead>
            <tbody>
              {data.recentClients.length > 0 ? (
                data.recentClients.map((client, index) => (
                  <tr key={client.id} className={cn('border-b border-border/50 hover:bg-secondary/40 transition-colors', index === data.recentClients.length - 1 && 'border-0')}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{client.company.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.company}</p>
                          <p className="text-sm text-muted-foreground">{client.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{client.contact}</td>
                    <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {client.totalPaid > 0 ? formatCurrency(client.totalPaid) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Henüz müşteri kaydı yok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}
