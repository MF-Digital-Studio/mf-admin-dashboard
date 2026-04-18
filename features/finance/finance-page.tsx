'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, CartesianGrid, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, DollarSign, Percent, Star, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { StatusBadge } from '@/components/shared/badges'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog, type PaymentFormValues } from '@/components/shared/create-entity-dialog'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import type { Payment, ServiceName } from '@/types'

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#06b6d4']

type PaymentDetailsResponse = {
  payment: Payment
  editable: PaymentFormValues
}

type RevenuePoint = {
  month: string
  revenue: number
  expenses: number
}

type BreakdownPoint = {
  name: string
  value: number
}

const serviceLabelMap: Record<ServiceName, string> = {
  'Web Design': 'Web Tasarım',
  SEO: 'SEO',
  'QR Menu': 'QR Menü',
  'E-commerce': 'E-ticaret',
}

const categoryLabelMap: Record<ServiceName, string> = {
  'Web Design': 'Web Tasarım',
  SEO: 'SEO',
  'QR Menu': 'QR Menü',
  'E-commerce': 'E-ticaret',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
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

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date)
}

function toDateSafe(dateString: string): Date | null {
  if (!dateString || dateString === '-') {
    return null
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPayments = useCallback(async () => {
    const data = await fetchJson<Payment[]>('/api/payments')
    setPayments(data)
  }, [])

  const loadPaymentDetails = useCallback(async (paymentId: string) => {
    const data = await fetchJson<PaymentDetailsResponse>(`/api/payments/${paymentId}`)
    setPaymentDetails(data)
  }, [])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchJson<Payment[]>('/api/payments')
        if (mounted) {
          setPayments(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load payments')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void run()
    return () => {
      mounted = false
    }
  }, [])

  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    const monthAmounts = new Map<string, number>()
    for (const payment of payments.filter((p) => p.status === 'Paid')) {
      const date = toDateSafe(payment.date)
      if (!date) {
        continue
      }
      const key = monthKey(date)
      monthAmounts.set(key, (monthAmounts.get(key) ?? 0) + payment.amount)
    }

    const points: RevenuePoint[] = []
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      const key = monthKey(date)
      points.push({
        month: monthLabel(date),
        revenue: Math.round(monthAmounts.get(key) ?? 0),
        expenses: 0,
      })
    }

    return points
  }, [payments])

  const expenseBreakdown = useMemo(() => {
    const byCategory = new Map<string, number>()
    for (const payment of payments) {
      byCategory.set(payment.category, (byCategory.get(payment.category) ?? 0) + payment.amount)
    }

    const rows: BreakdownPoint[] = [...byCategory.entries()].map(([category, value]) => ({
      name: categoryLabelMap[category as ServiceName] ?? category,
      value,
    }))

    rows.sort((a, b) => b.value - a.value)
    return rows.slice(0, 5)
  }, [payments])

  const totalRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0
  const totalExpenses = monthlyRevenue[monthlyRevenue.length - 1]?.expenses ?? 0
  const netProfit = totalRevenue - totalExpenses
  const pendingPayments = payments.filter((payment) => payment.status === 'Pending' || payment.status === 'Overdue')
  const pendingTotal = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)

  const paidTotal = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.amount, 0)
  const allTotal = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const collectionRate = allTotal > 0 ? Math.round((paidTotal / allTotal) * 100) : 0

  const bestService = useMemo(() => {
    const byService = new Map<ServiceName, number>()
    for (const payment of payments.filter((payment) => payment.status === 'Paid')) {
      const service = payment.category
      byService.set(service, (byService.get(service) ?? 0) + payment.amount)
    }
    if (byService.size === 0) {
      return { name: '-', value: 0 }
    }
    const [name, value] = [...byService.entries()].sort((a, b) => b[1] - a[1])[0]
    return { name, value }
  }, [payments])

  const bestClient = useMemo(() => {
    const byClient = new Map<string, number>()
    for (const payment of payments.filter((payment) => payment.status === 'Paid')) {
      byClient.set(payment.client, (byClient.get(payment.client) ?? 0) + payment.amount)
    }
    if (byClient.size === 0) {
      return { name: '-', value: 0 }
    }
    const [name, value] = [...byClient.entries()].sort((a, b) => b[1] - a[1])[0]
    return { name, value }
  }, [payments])

  const currentRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0
  const previousRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.revenue ?? 0
  const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  const activePayment = payments.find((payment) => payment.id === activePaymentId) ?? null
  const activeEditableValues: PaymentFormValues | undefined = paymentDetails?.editable
    ? paymentDetails.editable
    : activePayment
      ? {
          clientId: activePayment.clientId,
          projectId: activePayment.projectId ?? '',
          amount: activePayment.amount,
          date: activePayment.date === '-' ? '' : activePayment.date,
          category: activePayment.category,
          status: activePayment.status,
          method: activePayment.method,
          notes: activePayment.notes ?? '',
        }
      : undefined

  const handleCreatePayment = async (payload: PaymentFormValues) => {
    setError(null)
    try {
      await fetchJson('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await loadPayments()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create payment'
      setError(message)
      throw err
    }
  }

  const handleUpdatePayment = async (payload: PaymentFormValues) => {
    if (!activePaymentId) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/payments/${activePaymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await Promise.all([loadPayments(), loadPaymentDetails(activePaymentId)])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update payment'
      setError(message)
      throw err
    }
  }

  const handleDeletePayment = async (payment: Payment) => {
    const confirmed = window.confirm(`"${payment.client}" ödeme kaydını silmek istiyor musunuz?`)
    if (!confirmed) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/payments/${payment.id}`, {
        method: 'DELETE',
      })
      if (activePaymentId === payment.id) {
        setActivePaymentId(null)
        setPaymentDetails(null)
      }
      await loadPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment')
    }
  }

  const openEdit = async (paymentId: string) => {
    setActivePaymentId(paymentId)
    setError(null)
    try {
      await loadPaymentDetails(paymentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment details')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full">
      <PageHeader
        title="Finans"
        description="Canlı ödeme ve tahsilat özeti"
        action={
          <CreateEntityDialog
            entity="payment"
            trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Ödeme</Button>}
            onPaymentSubmit={handleCreatePayment}
          />
        }
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Aylık Gelir"
          value={formatCurrency(totalRevenue)}
          subtext={`Geçen aya göre ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
          subtextClassName="text-emerald-400"
          icon={DollarSign}
          iconToneClassName="text-emerald-400"
          iconBackgroundClassName="bg-emerald-500/10"
          trendIcon={TrendingUp}
          trendIconClassName="text-emerald-400"
        />
        <StatCard
          label="Aylık Gider"
          value={formatCurrency(totalExpenses)}
          subtext="Gider modeli henüz bağlanmadı"
          subtextClassName="text-muted-foreground"
          icon={TrendingDown}
          iconToneClassName="text-red-400"
          iconBackgroundClassName="bg-red-500/10"
        />
        <StatCard
          label="Net Kâr (Tahmini)"
          value={formatCurrency(netProfit)}
          subtext={totalRevenue > 0 ? `%${Math.round((netProfit / totalRevenue) * 100)} marj` : '%0 marj'}
          subtextClassName="text-primary"
          icon={Percent}
          iconToneClassName="text-primary"
          iconBackgroundClassName="bg-primary/10"
        />
        <StatCard
          label="Bekleyen Faturalar"
          value={formatCurrency(pendingTotal)}
          subtext={`${pendingPayments.length} açık kayıt`}
          subtextClassName="text-yellow-400"
          icon={AlertCircle}
          iconToneClassName="text-yellow-400"
          iconBackgroundClassName="bg-yellow-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-1">Gelir Trendi</h3>
          <p className="text-sm text-muted-foreground mb-4">Son 7 ay</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.20 250)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.20 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.008 264)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 264)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 264)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Gelir" stroke="oklch(0.65 0.20 250)" strokeWidth={2} fill="url(#revGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-1">Kategori Dağılımı</h3>
          <p className="text-sm text-muted-foreground mb-3">Ödemelere göre</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {expenseBreakdown.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'oklch(0.13 0.006 264)', border: '1px solid oklch(0.22 0.008 264)', borderRadius: '8px', fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {expenseBreakdown.map((expense, index) => (
              <div key={expense.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground">{expense.name}</span>
                </div>
                <span className="font-semibold text-foreground">{formatCurrency(expense.value)}</span>
              </div>
            ))}
            {expenseBreakdown.length === 0 && <p className="text-sm text-muted-foreground">Henüz ödeme verisi yok</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { icon: Star, label: 'En İyi Hizmet', value: bestService.name === '-' ? '-' : serviceLabelMap[bestService.name as ServiceName], sub: formatCurrency(bestService.value), color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: Target, label: 'En İyi Müşteri', value: bestClient.name, sub: formatCurrency(bestClient.value), color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Percent, label: 'Tahsilat Oranı', value: `%${collectionRate}`, sub: `${formatCurrency(pendingTotal)} bekliyor`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: TrendingUp, label: 'Aylık Büyüme', value: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`, sub: 'Ödeme gelirine göre', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-base font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={`text-sm font-medium mt-1 ${card.color}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <TableWrapper title="Ödeme Kayıtları">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Müşteri', 'Kategori', 'Tutar', 'Tarih', 'Yöntem', 'Durum', 'İşlemler'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                payments.map((payment, index) => (
                  <tr key={payment.id} className={`border-b border-border/50 hover:bg-secondary/40 transition-colors ${index === payments.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{payment.client}</td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryLabelMap[payment.category]}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.method}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        <CreateEntityDialog
                          entity="payment"
                          mode="edit"
                          paymentInitialValues={activePaymentId === payment.id ? activeEditableValues : {
                            clientId: payment.clientId,
                            projectId: payment.projectId ?? '',
                            amount: payment.amount,
                            date: payment.date === '-' ? '' : payment.date,
                            category: payment.category,
                            status: payment.status,
                            method: payment.method,
                            notes: payment.notes ?? '',
                          }}
                          onPaymentSubmit={handleUpdatePayment}
                          trigger={
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-border px-2"
                              onClick={() => {
                                void openEdit(payment.id)
                              }}
                            >
                              Düzenle
                            </Button>
                          }
                        />
                        <Button size="sm" variant="outline" className="h-7 border-red-500/30 px-2 text-red-300 hover:bg-red-500/10" onClick={() => void handleDeletePayment(payment)}>
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {isLoading && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Ödemeler yükleniyor...</p>
          </div>
        )}
        {!isLoading && payments.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Ödeme kaydı bulunamadı</p>
          </div>
        )}
      </TableWrapper>

      <TableWrapper title="Gider Kayıtları">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Gider Adı', 'Kategori', 'Tutar', 'Tarih'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Gider modeli henüz bağlı değil. Bu bölüm ödeme verileri dışında tutuldu.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}
