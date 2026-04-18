'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronRight, Mail, MapPin, Phone, X } from 'lucide-react'
import { BadgePill, StatusBadge } from '@/components/shared/badges'
import InlineSelect from '@/components/ui/inline-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog, type ClientFormValues } from '@/components/shared/create-entity-dialog'
import { emitDashboardDataRefresh } from '@/lib/dashboard-events'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { Client, Payment, Project, ServiceName } from '@/types'
import { toast } from 'sonner'

const statuses = ['All', 'Active', 'Lead', 'In Discussion', 'Completed', 'Inactive']
const serviceTypes = ['All', 'Web Design', 'SEO', 'QR Menu', 'E-commerce']

const serviceTone: Record<ServiceName, 'blue' | 'emerald' | 'orange' | 'purple'> = {
  'Web Design': 'blue',
  SEO: 'emerald',
  'QR Menu': 'orange',
  'E-commerce': 'purple',
}

const serviceLabelMap: Record<ServiceName, string> = {
  'Web Design': 'Web Tasarım',
  SEO: 'SEO',
  'QR Menu': 'QR Menü',
  'E-commerce': 'E-ticaret',
}

type ClientDetailsResponse = {
  client: Client
  editable: ClientFormValues
  projects: Array<Pick<Project, 'id' | 'name' | 'status' | 'progress'>>
  payments: Array<Pick<Payment, 'id' | 'date' | 'status' | 'amount'>>
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState<ClientDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    const data = await fetchJson<Client[]>('/api/clients')
    setClients(data)
  }, [])

  const loadClientDetails = useCallback(async (id: string) => {
    setIsDetailLoading(true)
    try {
      const data = await fetchJson<ClientDetailsResponse>(`/api/clients/${id}`)
      setSelectedDetails(data)
    } finally {
      setIsDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchJson<Client[]>('/api/clients')
        if (mounted) {
          setClients(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load clients')
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

  useEffect(() => {
    if (!selected) {
      setSelectedDetails(null)
      return
    }

    setError(null)
    void loadClientDetails(selected).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load client details')
    })
  }, [loadClientDetails, selected])

  const filtered = useMemo(
    () =>
      clients.filter((client) => {
        const matchSearch =
          client.company.toLowerCase().includes(search.toLowerCase()) ||
          client.contact.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'All' || client.status === statusFilter
        const matchService = serviceFilter === 'All' || (client.services as ServiceName[]).includes(serviceFilter as ServiceName)

        return matchSearch && matchStatus && matchService
      }),
    [clients, search, serviceFilter, statusFilter]
  )

  const selectedClient = selectedDetails?.client ?? clients.find((client) => client.id === selected) ?? null
  const clientProjects = selectedDetails?.projects ?? []
  const clientPayments = selectedDetails?.payments ?? []

  const selectedEditableValues: ClientFormValues | undefined = selectedDetails?.editable
    ? selectedDetails.editable
    : selectedClient
      ? {
        company: selectedClient.company,
        contact: selectedClient.contact,
        phone: selectedClient.phone,
        email: selectedClient.email,
        service: selectedClient.services[0] ?? 'Web Design',
        status: selectedClient.status,
        notes: selectedClient.notes ?? '',
      }
      : undefined

  const handleCreateClient = async (payload: ClientFormValues) => {
    setError(null)
    try {
      await fetchJson('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await loadClients()
      toast.success('Müşteri oluşturuldu')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create client'
      setError(message)
      throw err
    }
  }

  const handleUpdateClient = async (payload: ClientFormValues) => {
    if (!selected) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/clients/${selected}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await Promise.all([loadClients(), loadClientDetails(selected)])
      toast.success('Müşteri güncellendi')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update client'
      setError(message)
      throw err
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) {
      return
    }

    // show a confirm dialog instead of native confirm
    setConfirmOpen(true)
    return

    setError(null)
    try {
      await fetchJson(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      })
      setSelected(null)
      setSelectedDetails(null)
      await loadClients()
      toast.success('Müşteri silindi')
      emitDashboardDataRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }

  const doDeleteClient = async () => {
    if (!selectedClient) return
    setConfirmOpen(false)
    setError(null)
    try {
      await fetchJson(`/api/clients/${selectedClient.id}`, { method: 'DELETE' })
      setSelected(null)
      setSelectedDetails(null)
      await loadClients()
      toast.success('Müşteri silindi')
      emitDashboardDataRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className={cn('flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 transition-all', selected && 'hidden xl:block')}>
        <PageHeader
          title="Müşteriler"
          description={`${clients.length} toplam müşteri`}
          action={
            <CreateEntityDialog
              entity="client"
              trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Müşteri Ekle</Button>}
              onClientSubmit={handleCreateClient}
            />
          }
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchField value={search} onChange={setSearch} placeholder="Müşteri ara..." className="flex-1 max-w-xs" />
          <FilterGroup options={statuses} value={statusFilter} onChange={setStatusFilter} />
          <FilterGroup options={serviceTypes} value={serviceFilter} onChange={setServiceFilter} />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <TableWrapper title="Müşteri Listesi">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Şirket', 'İletişim', 'Hizmetler', 'Durum', 'Projeler', 'Toplam Ödeme', 'Son İletişim', ''].map((heading) => (
                    <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  filtered.map((client, index) => (
                    <tr
                      key={client.id}
                      onClick={() => setSelected(client.id === selected ? null : client.id)}
                      className={cn(
                        'border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer',
                        client.id === selected && 'bg-secondary/60',
                        index === filtered.length - 1 && 'border-0'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{client.company.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.company}</p>
                            <p className="text-xs text-muted-foreground">{client.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{client.contact}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {client.services.map((service) => (
                            <BadgePill key={service} tone={serviceTone[service]} uppercase={false} className="px-1.5 py-0.5 text-[10px]">
                              {serviceLabelMap[service]}
                            </BadgePill>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <InlineSelect
                          value={client.status}
                          options={[{ value: 'Lead', label: 'Potansiyel' }, { value: 'In Discussion', label: 'Görüşmede' }, { value: 'Active', label: 'Aktif' }, { value: 'Completed', label: 'Tamamlandı' }, { value: 'Inactive', label: 'Pasif' }]}
                          onChange={async (val) => {
                            await fetchJson(`/api/clients/${client.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: val }),
                            })
                            await loadClients()
                            toast.success('Durum güncellendi')
                            emitDashboardDataRefresh()
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-foreground">{client.activeProjects}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        {client.totalPaid > 0 ? formatCurrency(client.totalPaid) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{client.lastContact}</td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {isLoading && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Müşteriler yükleniyor...</p>
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Filtrelere uygun müşteri yok</p>
            </div>
          )}
        </TableWrapper>
      </div>

      {selectedClient && (
        <div className="w-full xl:w-[380px] border-l border-border bg-card overflow-y-auto shrink-0">
          <div className="sticky top-0 bg-card border-b border-border px-5 py-4 z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Müşteri Detayı</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              <CreateEntityDialog
                entity="client"
                mode="edit"
                clientInitialValues={selectedEditableValues}
                onClientSubmit={handleUpdateClient}
                trigger={<Button size="sm" variant="outline" className="h-8 border-border">Düzenle</Button>}
              />
              <Button size="sm" variant="outline" className="h-8 border-red-500/30 text-red-300 hover:bg-red-500/10" onClick={handleDeleteClient}>
                Sil
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{selectedClient.company.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-foreground text-base">{selectedClient.company}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedClient.location}</span>
                </div>
              </div>
              <StatusBadge status={selectedClient.status} className="ml-auto" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">İletişim</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-4 h-4 rounded bg-secondary flex items-center justify-center"><Mail className="w-2.5 h-2.5 text-muted-foreground" /></span>
                  {selectedClient.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-4 h-4 rounded bg-secondary flex items-center justify-center"><Phone className="w-2.5 h-2.5 text-muted-foreground" /></span>
                  {selectedClient.phone}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Hizmetler</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedClient.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded bg-secondary border border-border text-sm font-medium text-foreground">
                    {serviceLabelMap[tag]}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Projeler ({clientProjects.length})</p>
              <div className="space-y-2">
                {isDetailLoading ? (
                  <p className="text-sm text-muted-foreground">Detaylar yükleniyor...</p>
                ) : clientProjects.length > 0 ? (
                  clientProjects.map((project) => (
                    <div key={project.id} className="p-3 rounded-lg bg-secondary border border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="w-full bg-border rounded-full h-1">
                        <div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">%{project.progress} tamamlandı</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Henüz proje yok</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ödeme Özeti</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-secondary border border-border">
                  <p className="text-sm text-muted-foreground">Toplam Ödeme</p>
                  <p className="text-base font-bold text-foreground mt-0.5">{formatCurrency(selectedClient.totalPaid)}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary border border-border">
                  <p className="text-sm text-muted-foreground">Son İletişim</p>
                  <p className="text-base font-bold text-foreground mt-0.5">{selectedClient.lastContact}</p>
                </div>
              </div>
              {clientPayments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {clientPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{payment.date}</span>
                      <StatusBadge status={payment.status} />
                      <span className="font-semibold text-foreground">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notlar</p>
              <p className="text-sm text-muted-foreground bg-secondary rounded-lg p-3 border border-border leading-relaxed">
                {selectedClient.notes || 'Not yok'}
              </p>
            </div>
          </div>
          <ConfirmDialog
            open={confirmOpen}
            title="Müşteriyi sil"
            description={`"${selectedClient.company}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            confirmLabel="Sil"
            cancelLabel="İptal"
            onClose={(confirmed) => {
              if (confirmed) void doDeleteClient()
              else setConfirmOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
