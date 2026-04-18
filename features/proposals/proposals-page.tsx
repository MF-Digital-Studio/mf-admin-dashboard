'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/shared/badges'
import InlineSelect from '@/components/ui/inline-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog, type ProposalFormValues } from '@/components/shared/create-entity-dialog'
import { emitDashboardDataRefresh } from '@/lib/dashboard-events'
import { cn } from '@/lib/utils'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import type { PipelineStage, Proposal } from '@/types'
import { toast } from 'sonner'

const pipelineColors: Record<string, string> = {
  'Yeni Potansiyel': 'bg-slate-500',
  'İletişim Kuruldu': 'bg-blue-500',
  'Teklif Gönderildi': 'bg-purple-500',
  Müzakere: 'bg-yellow-500',
  Kazanıldı: 'bg-emerald-500',
  Kaybedildi: 'bg-red-500',
}

type ProposalDetailsResponse = {
  proposal: Proposal
  editable: ProposalFormValues
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null)
  const [proposalDetails, setProposalDetails] = useState<ProposalDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmProposal, setConfirmProposal] = useState<null | { id: string; title: string }>(null)

  const loadProposals = useCallback(async () => {
    const data = await fetchJson<Proposal[]>('/api/proposals')
    setProposals(data)
  }, [])

  const loadProposalDetails = useCallback(async (proposalId: string) => {
    const data = await fetchJson<ProposalDetailsResponse>(`/api/proposals/${proposalId}`)
    setProposalDetails(data)
  }, [])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchJson<Proposal[]>('/api/proposals')
        if (mounted) {
          setProposals(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load proposals')
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

  const total = proposals.length
  const accepted = proposals.filter((proposal) => proposal.status === 'Accepted').length
  const pending = proposals.filter((proposal) => ['Sent', 'Under Review'].includes(proposal.status)).length
  const pendingValue = proposals
    .filter((proposal) => ['Sent', 'Under Review'].includes(proposal.status))
    .reduce((sum, proposal) => sum + proposal.amount, 0)

  const pipelineStages = useMemo(
    () =>
      [
        {
          stage: 'Yeni Potansiyel',
          count: proposals.filter((proposal) => proposal.status === 'Draft').length,
          value: proposals.filter((proposal) => proposal.status === 'Draft').reduce((sum, proposal) => sum + proposal.amount, 0),
        },
        { stage: 'İletişim Kuruldu', count: 0, value: 0 },
        {
          stage: 'Teklif Gönderildi',
          count: proposals.filter((proposal) => proposal.status === 'Sent').length,
          value: proposals.filter((proposal) => proposal.status === 'Sent').reduce((sum, proposal) => sum + proposal.amount, 0),
        },
        {
          stage: 'Müzakere',
          count: proposals.filter((proposal) => proposal.status === 'Under Review').length,
          value: proposals.filter((proposal) => proposal.status === 'Under Review').reduce((sum, proposal) => sum + proposal.amount, 0),
        },
        {
          stage: 'Kazanıldı',
          count: proposals.filter((proposal) => proposal.status === 'Accepted').length,
          value: proposals.filter((proposal) => proposal.status === 'Accepted').reduce((sum, proposal) => sum + proposal.amount, 0),
        },
        {
          stage: 'Kaybedildi',
          count: proposals.filter((proposal) => proposal.status === 'Rejected').length,
          value: proposals.filter((proposal) => proposal.status === 'Rejected').reduce((sum, proposal) => sum + proposal.amount, 0),
        },
      ] satisfies PipelineStage[],
    [proposals]
  )

  const activeProposal = proposals.find((proposal) => proposal.id === activeProposalId) ?? null
  const activeEditableValues: ProposalFormValues | undefined = proposalDetails?.editable
    ? proposalDetails.editable
    : activeProposal
      ? {
        title: activeProposal.title,
        clientId: activeProposal.clientId,
        amount: activeProposal.amount,
        sentDate: activeProposal.sentDate ?? '',
        status: activeProposal.status,
        followUp: activeProposal.followUp ?? '',
        notes: activeProposal.notes ?? '',
      }
      : undefined

  const handleCreateProposal = async (payload: ProposalFormValues) => {
    setError(null)
    try {
      await fetchJson('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await loadProposals()
      toast.success('Teklif oluşturuldu')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create proposal'
      setError(message)
      throw err
    }
  }

  const handleUpdateProposal = async (payload: ProposalFormValues) => {
    if (!activeProposalId) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/proposals/${activeProposalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await Promise.all([loadProposals(), loadProposalDetails(activeProposalId)])
      toast.success('Teklif güncellendi')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update proposal'
      setError(message)
      throw err
    }
  }

  const handleDeleteProposal = async (proposal: Proposal) => {
    setConfirmProposal({ id: proposal.id, title: proposal.title })
  }

  const doDeleteProposal = async (id: string) => {
    setConfirmProposal(null)
    setError(null)
    try {
      await fetchJson(`/api/proposals/${id}`, { method: 'DELETE' })
      if (activeProposalId === id) {
        setActiveProposalId(null)
        setProposalDetails(null)
      }
      await loadProposals()
      toast.success('Teklif silindi')
      emitDashboardDataRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proposal')
    }
  }

  const openEdit = async (proposalId: string) => {
    setActiveProposalId(proposalId)
    setError(null)
    try {
      await loadProposalDetails(proposalId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposal details')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full">
      <PageHeader
        title="Teklifler"
        description="Satış hattı ve teklif takibi"
        action={
          <CreateEntityDialog
            entity="proposal"
            trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Teklif</Button>}
            onProposalSubmit={handleCreateProposal}
          />
        }
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Toplam Teklif" value={String(total)} icon={FileText} iconToneClassName="text-primary" iconBackgroundClassName="bg-primary/10" />
        <StatCard
          label="Kabul Edilen"
          value={String(accepted)}
          subtext={total > 0 ? `${Math.round((accepted / total) * 100)}% kazanma oranı` : '0% kazanma oranı'}
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
            const width = totalCount > 0 ? (stage.count / totalCount) * 100 : 0

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
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Teklif', 'Müşteri', 'Tutar', 'Gönderim Tarihi', 'Durum', 'Takip', 'İşlemler'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                proposals.map((proposal, index) => (
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
                    <td className="px-4 py-3 text-muted-foreground">{proposal.sentDate ?? '-'}</td>
                    <td className="px-4 py-3">
                      <InlineSelect
                        value={proposal.status}
                        options={[{ value: 'Draft', label: 'Taslak' }, { value: 'Sent', label: 'Gönderildi' }, { value: 'Under Review', label: 'İncelemede' }, { value: 'Accepted', label: 'Kabul' }, { value: 'Rejected', label: 'Reddedildi' }]}
                        onChange={async (val) => {
                          await fetchJson(`/api/proposals/${proposal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: val }) })
                          await loadProposals()
                          toast.success('Durum güncellendi')
                          emitDashboardDataRefresh()
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{proposal.followUp ?? '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        <CreateEntityDialog
                          entity="proposal"
                          mode="edit"
                          proposalInitialValues={activeProposalId === proposal.id ? activeEditableValues : {
                            title: proposal.title,
                            clientId: proposal.clientId,
                            amount: proposal.amount,
                            sentDate: proposal.sentDate ?? '',
                            status: proposal.status,
                            followUp: proposal.followUp ?? '',
                            notes: proposal.notes ?? '',
                          }}
                          onProposalSubmit={handleUpdateProposal}
                          trigger={
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-border px-2"
                              onClick={() => {
                                void openEdit(proposal.id)
                              }}
                            >
                              Düzenle
                            </Button>
                          }
                        />
                        <Button size="sm" variant="outline" className="h-7 border-red-500/30 px-2 text-red-300 hover:bg-red-500/10" onClick={() => void handleDeleteProposal(proposal)}>
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
            <p className="text-sm text-muted-foreground">Teklifler yükleniyor...</p>
          </div>
        )}
        {!isLoading && proposals.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Teklif bulunamadı</p>
          </div>
        )}
      </TableWrapper>
      {confirmProposal && (
        <ConfirmDialog
          open={Boolean(confirmProposal)}
          title="Teklifi sil"
          description={`"${confirmProposal?.title}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmLabel="Sil"
          cancelLabel="İptal"
          onClose={(confirmed) => {
            if (confirmed && confirmProposal) void doDeleteProposal(confirmProposal.id)
            else setConfirmProposal(null)
          }}
        />
      )}
    </div>
  )
}
