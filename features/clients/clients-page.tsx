'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Mail, MapPin, Phone, X } from 'lucide-react'
import { clients } from '@/features/clients/data'
import { projects } from '@/features/projects/data'
import { payments } from '@/features/finance/data'
import { BadgePill, StatusBadge } from '@/components/shared/badges'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { ServiceName } from '@/types'

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

export function ClientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

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
    [search, serviceFilter, statusFilter]
  )

  const selectedClient = clients.find((client) => client.id === selected)
  const clientProjects = selectedClient ? projects.filter((project) => project.clientId === selectedClient.id) : []
  const clientPayments = selectedClient ? payments.filter((payment) => payment.client === selectedClient.company) : []

  return (
    <div className="flex h-full overflow-hidden">
      <div className={cn('flex-1 overflow-y-auto p-6 space-y-5 transition-all', selected && 'hidden xl:block')}>
        <PageHeader
          title="Müşteriler"
          description={`${clients.length} toplam müşteri`}
          action={<CreateEntityDialog entity="client" trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Müşteri Ekle</Button>} />}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchField value={search} onChange={setSearch} placeholder="Müşteri ara..." className="flex-1 max-w-xs" />
          <FilterGroup options={statuses} value={statusFilter} onChange={setStatusFilter} />
          <FilterGroup options={serviceTypes} value={serviceFilter} onChange={setServiceFilter} />
        </div>

        <TableWrapper title="Müşteri Listesi">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
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
                {filtered.map((client, index) => (
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
                    <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
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
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Filtrelere uygun müşteri yok</p>
            </div>
          )}
        </TableWrapper>
      </div>

      {selectedClient && (
        <div className="w-full xl:w-[380px] border-l border-border bg-card overflow-y-auto shrink-0">
          <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
            <h3 className="text-base font-semibold text-foreground">Müşteri Detayı</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
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
                {clientProjects.length > 0 ? (
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
                {selectedClient.notes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
