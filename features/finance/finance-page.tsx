'use client'

import { AreaChart, Area, CartesianGrid, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, DollarSign, Percent, Star, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { expenseBreakdown, expenses, monthlyRevenue, payments } from '@/features/finance/data'
import { StatusBadge } from '@/components/shared/badges'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#06b6d4']

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

export function FinancePage() {
  const totalRevenue = monthlyRevenue[monthlyRevenue.length - 1].revenue
  const totalExpenses = monthlyRevenue[monthlyRevenue.length - 1].expenses
  const netProfit = totalRevenue - totalExpenses
  const pendingTotal = payments.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <PageHeader title="Finans" description="Mayıs 2024 özeti" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Aylık Gelir"
          value={formatCurrency(totalRevenue)}
          subtext="Geçen aya göre +18.7%"
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
          subtext="5 gider kategorisi"
          subtextClassName="text-muted-foreground"
          icon={TrendingDown}
          iconToneClassName="text-red-400"
          iconBackgroundClassName="bg-red-500/10"
        />
        <StatCard
          label="Net Kâr (Tahmini)"
          value={formatCurrency(netProfit)}
          subtext={`%${Math.round((netProfit / totalRevenue) * 100)} marj`}
          subtextClassName="text-primary"
          icon={Percent}
          iconToneClassName="text-primary"
          iconBackgroundClassName="bg-primary/10"
        />
        <StatCard
          label="Bekleyen Faturalar"
          value={formatCurrency(pendingTotal)}
          subtext="2 açık kayıt"
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
          <h3 className="text-base font-semibold text-foreground mb-1">Gider Dağılımı</h3>
          <p className="text-sm text-muted-foreground mb-3">Kategoriye göre</p>
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { icon: Star, label: 'En İyi Hizmet', value: 'E-ticaret', sub: '₺70.000 gelir', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: Target, label: 'En İyi Müşteri', value: 'Bodrum Butik Otel', sub: '₺54.000 ödendi', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Percent, label: 'Tahsilat Oranı', value: '%89', sub: '₺5.000 bekliyor', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: TrendingUp, label: 'Aylık Büyüme', value: '+18.7%', sub: 'Nisan 2024 karşısında', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {['Müşteri', 'Kategori', 'Tutar', 'Tarih', 'Yöntem', 'Durum'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id} className={`border-b border-border/50 hover:bg-secondary/40 transition-colors ${index === payments.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{payment.client}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.category}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      <TableWrapper title="Gider Kayıtları">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {['Gider Adı', 'Kategori', 'Tutar', 'Tarih'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense.id} className={`border-b border-border/50 hover:bg-secondary/40 transition-colors ${index === expenses.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{expense.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{expense.category}</td>
                  <td className="px-4 py-3 font-bold text-red-400">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{expense.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}
