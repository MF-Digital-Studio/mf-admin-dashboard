import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  subtextClassName?: string
  icon: LucideIcon
  iconToneClassName: string
  iconBackgroundClassName: string
  trendIcon?: LucideIcon
  trendIconClassName?: string
}

export function StatCard({
  label,
  value,
  subtext,
  subtextClassName,
  icon: Icon,
  iconToneClassName,
  iconBackgroundClassName,
  trendIcon: TrendIcon,
  trendIconClassName,
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-border/80 hover:bg-card/80 transition-all">
      <div className="flex items-center justify-between">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBackgroundClassName)}>
          <Icon className={cn('w-4 h-4', iconToneClassName)} />
        </div>
        {TrendIcon && <TrendIcon className={cn('w-3.5 h-3.5', trendIconClassName)} />}
      </div>
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
      </div>
      {subtext && <p className={cn('text-[11px] font-medium', subtextClassName)}>{subtext}</p>}
    </div>
  )
}
