'use client'

import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react'
import { proposals, pipelineStages } from '@/features/proposals/data'
import { StatusBadge } from '@/components/shared/badges'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'

const pipelineColors: Record<string, string> = {
  'Yeni Potansiyel': 'bg-slate-500',
  'İletişim Kuruldu': 'bg-blue-500',
  'Teklif Gönderildi': 'bg-purple-500',
  Müzakere: 'bg-yellow-500',
  Kazanıldı: 'bg-emerald-500',
  Kaybedildi: 'bg-red-500',
}

export function ProposalsPage() {
  const total = proposals.length
  const accepted = proposals.filter((proposal) => proposal.status === 'Accepted').length
  const pending = proposals.filter((proposal) => ['Sent', 'Under Review'].includes(proposal.status)).length
  const pendingValue = proposals
    .filter((proposal) => ['Sent', 'Under Review'].includes(proposal.status))
    .reduce((sum, proposal) => sum + proposal.amount, 0)

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full">
      <PageHeader
        title="Teklifler"
        description="Satış hattı ve teklif takibi"
        action={<CreateEntityDialog entity="proposal" trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Teklif</Button>} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Toplam Teklif" value={String(total)} icon={FileText} iconToneClassName="text-primary" iconBackgroundClassName="bg-primary/10" />
        <StatCard
          label="Kabul Edilen"
          value={String(accepted)}
          subtext={`${Math.round((accepted / total) * 100)}% kazanma oranı`}
          subtextClassName="text-emerald-400"
          icon={CheckCircle}
          iconToneClassName="text-emerald-400"
          iconBackgroundClassName="bg-emerald-500/10"
        />
        <StatCard label="Yanıt Bekleyen" value={String(pending)} icon={Clock} iconToneClassName="text-yellow-400" iconBackgroundClassName="bg-yellow-500/10" />
        <StatCard label="Havuz Değeri" value={formatCurrency(pendingValue)} icon={DollarSign} iconToneClassName="text-blue-400" iconBackgroundClassName="bg-blue-500/10" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Satış Hattı</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {pipelineStages.map((stage) => (
            <div key={stage.stage} className="text-center">
              <div className={cn('w-full h-1.5 rounded-full mb-2', pipelineColors[stage.stage] || 'bg-secondary')} />
              <p className="text-sm text-muted-foreground font-medium">{stage.stage}</p>
              <p className="text-lg font-bold text-foreground mt-1">{stage.count}</p>
              <p className="text-sm text-muted-foreground">{formatCompactCurrency(stage.value)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex rounded-full overflow-hidden h-2">
          {pipelineStages.map((stage) => {
            const totalCount = pipelineStages.reduce((sum, pipelineStage) => sum + pipelineStage.count, 0)
            const width = (stage.count / totalCount) * 100

            return (
              <div
                key={stage.stage}
                className={cn(pipelineColors[stage.stage] || 'bg-secondary', 'transition-all')}
                style={{ width: `${width}%` }}
                title={stage.stage}
              />
            )
          })}
        </div>
      </div>

      <TableWrapper title="Tüm Teklifler">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Teklif', 'Müşteri', 'Tutar', 'Gönderim Tarihi', 'Durum', 'Takip'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal, index) => (
                <tr key={proposal.id} className={cn('border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer', index === proposals.length - 1 && 'border-0')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">{proposal.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{proposal.client}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(proposal.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{proposal.sentDate ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={proposal.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{proposal.followUp ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}
