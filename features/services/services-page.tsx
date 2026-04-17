'use client'

import { Check, Globe, Plus, QrCode, Shield, ShoppingBag, TrendingUp } from 'lucide-react'
import { services } from '@/features/services/data'
import { PageHeader } from '@/components/shared/page-header'
import { BadgePill } from '@/components/shared/badges'

const iconMap: Record<string, any> = {
  Globe,
  TrendingUp,
  QrCode,
  ShoppingBag,
  Shield,
}

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20', iconBg: 'bg-blue-500/15' },
  green: { bg: 'bg-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/15' },
  orange: { bg: 'bg-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20', iconBg: 'bg-orange-500/15' },
  purple: { bg: 'bg-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20', iconBg: 'bg-purple-500/15' },
  cyan: { bg: 'bg-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20', iconBg: 'bg-cyan-500/15' },
}

export function ServicesPage() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <PageHeader title="Hizmetler" description="İç hizmet kataloğu - teklif hazırlarken kullanın" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((service) => {
          const Icon = iconMap[service.icon] ?? Globe
          const colors = colorMap[service.color] ?? colorMap.blue

          return (
            <div key={service.id} className={`bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${colors.border}`}>
              <div className={`p-5 ${colors.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${colors.text}`}>{service.currency}{service.startingPrice.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-muted-foreground">başlangıç fiyatı</p>
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground">{service.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{service.description}</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Teslim</p>
                  <BadgePill tone="slate" uppercase={false} className={`text-sm ${colors.iconBg} ${colors.text}`}>
                    {service.delivery}
                  </BadgePill>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Dahil Olanlar</p>
                  <ul className="space-y-1.5">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className={`w-3 h-3 ${colors.text} shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ek Hizmetler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.addons.map((addon) => (
                      <span key={addon} className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary border border-border text-sm text-muted-foreground">
                        <Plus className="w-2.5 h-2.5" />
                        {addon}
                      </span>
                    ))}
                  </div>
                </div>

                <button className={`w-full py-2 rounded-lg text-sm font-semibold border transition-colors ${colors.border} ${colors.text} hover:${colors.iconBg}`}>
                  Teklifte Kullan
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
