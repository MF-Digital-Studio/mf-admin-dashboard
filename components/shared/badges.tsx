import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { BadgeTone, PriorityLevel } from '@/types'

const toneClasses: Record<BadgeTone, string> = {
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

interface BadgePillProps {
  tone: BadgeTone
  children: ReactNode
  className?: string
  uppercase?: boolean
}

export function BadgePill({ tone, children, className, uppercase = true }: BadgePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        uppercase && 'uppercase',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

const statusTones: Record<string, { label: string; tone: BadgeTone }> = {
  Lead: { label: 'Potansiyel', tone: 'yellow' },
  'In Discussion': { label: 'Görüşmede', tone: 'blue' },
  Active: { label: 'Aktif', tone: 'emerald' },
  Completed: { label: 'Tamamlandı', tone: 'zinc' },
  Inactive: { label: 'Pasif', tone: 'zinc' },
  Planning: { label: 'Planlama', tone: 'slate' },
  Design: { label: 'Tasarım', tone: 'purple' },
  Development: { label: 'Geliştirme', tone: 'blue' },
  Revision: { label: 'Revizyon', tone: 'orange' },
  'Waiting for Client': { label: 'Müşteri Bekleniyor', tone: 'yellow' },
  'On Hold': { label: 'Beklemede', tone: 'red' },
  Todo: { label: 'Yapılacak', tone: 'slate' },
  'In Progress': { label: 'Devam Ediyor', tone: 'blue' },
  Review: { label: 'İncelemede', tone: 'purple' },
  Done: { label: 'Tamamlandı', tone: 'emerald' },
  Blocked: { label: 'Engelli', tone: 'red' },
  Paid: { label: 'Ödendi', tone: 'emerald' },
  Pending: { label: 'Bekliyor', tone: 'yellow' },
  Overdue: { label: 'Gecikmiş', tone: 'red' },
  Draft: { label: 'Taslak', tone: 'slate' },
  Sent: { label: 'Gönderildi', tone: 'blue' },
  'Under Review': { label: 'İncelemede', tone: 'purple' },
  Accepted: { label: 'Kabul Edildi', tone: 'emerald' },
  Rejected: { label: 'Reddedildi', tone: 'red' },
}

const priorityTones: Record<PriorityLevel, { label: string; tone: BadgeTone }> = {
  High: { label: 'Yüksek', tone: 'red' },
  Medium: { label: 'Orta', tone: 'yellow' },
  Low: { label: 'Düşük', tone: 'slate' },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusTones[status] ?? { label: status, tone: 'zinc' }
  return <BadgePill tone={config.tone} className={className}>{config.label}</BadgePill>
}

export function PriorityBadge({ priority, className }: { priority: PriorityLevel; className?: string }) {
  const config = priorityTones[priority]
  return <BadgePill tone={config.tone} className={className}>{config.label}</BadgePill>
}
