import { cn } from '@/lib/utils'

interface FilterGroupProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
  buttonClassName?: string
}

const filterLabelMap: Record<string, string> = {
  All: 'Tümü',
  Active: 'Aktif',
  Lead: 'Potansiyel',
  'In Discussion': 'Görüşmede',
  Completed: 'Tamamlandı',
  Inactive: 'Pasif',
  Planning: 'Planlama',
  Design: 'Tasarım',
  Development: 'Geliştirme',
  Revision: 'Revizyon',
  'Waiting for Client': 'Müşteri Bekleniyor',
  'On Hold': 'Beklemede',
  High: 'Yüksek',
  Medium: 'Orta',
  Low: 'Düşük',
  Todo: 'Yapılacak',
  'In Progress': 'Devam Ediyor',
  Review: 'İncelemede',
  Done: 'Tamamlandı',
  Blocked: 'Engelli',
  'Due Today': 'Bugün Teslim',
  Overdue: 'Geciken',
  'High Priority': 'Yüksek Öncelik',
  'Web Design': 'Web Tasarım',
  'QR Menu': 'QR Menü',
  'E-commerce': 'E-ticaret',
  SEO: 'SEO',
  Logos: 'Logolar',
  Contracts: 'Sözleşmeler',
  Assets: 'Varlıklar',
  Deliverables: 'Teslimatlar',
  Screenshots: 'Ekran Görüntüleri',
  Documents: 'Belgeler',
  'Client Notes': 'Müşteri Notları',
  'Meeting Notes': 'Toplantı Notları',
  'Internal Ideas': 'İç Fikirler',
  'Revision Requests': 'Revizyon Talepleri',
}

export function FilterGroup({ options, value, onChange, className, buttonClassName }: FilterGroupProps) {
  return (
    <div className={cn('flex gap-2 flex-wrap', className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'px-2.5 py-1 rounded text-[11px] font-medium border transition-colors',
            value === option
              ? 'bg-primary/15 text-primary border-primary/30'
              : 'border-border text-muted-foreground hover:bg-secondary',
            buttonClassName
          )}
        >
          {filterLabelMap[option] ?? option}
        </button>
      ))}
    </div>
  )
}
