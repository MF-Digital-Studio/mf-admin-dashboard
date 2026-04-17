'use client'

import { useMemo, useState } from 'react'
import { Calendar, DollarSign, X } from 'lucide-react'
import { projects } from '@/features/projects/data'
import { tasks } from '@/features/tasks/data'
import { BadgePill, PriorityBadge, StatusBadge } from '@/components/shared/badges'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { ServiceName } from '@/types'

const statuses = ['All', 'Planning', 'Design', 'Development', 'Revision', 'Waiting for Client', 'Completed', 'On Hold']
const priorities = ['All', 'High', 'Medium', 'Low']
const serviceFilters = ['All', 'Web Design', 'SEO', 'QR Menu', 'E-commerce']

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

export function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      projects.filter((project) => {
        const matchSearch =
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.client.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'All' || project.status === statusFilter
        const matchPriority = priorityFilter === 'All' || project.priority === priorityFilter
        const matchService = serviceFilter === 'All' || project.service === serviceFilter

        return matchSearch && matchStatus && matchPriority && matchService
      }),
    [priorityFilter, search, serviceFilter, statusFilter]
  )

  const selectedProject = projects.find((project) => project.id === selected)
  const projectTasks = selectedProject ? tasks.filter((task) => task.projectId === selectedProject.id) : []

  return (
    <div className="flex h-full overflow-hidden">
      <div className={cn('flex-1 overflow-y-auto p-4 sm:p-6 space-y-5', selected && 'hidden xl:block')}>
        <PageHeader
          title="Projeler"
          description={`${projects.length} toplam proje`}
          action={<CreateEntityDialog entity="project" trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Proje</Button>} />}
        />

        <div className="space-y-2">
          <SearchField value={search} onChange={setSearch} placeholder="Proje ara..." className="max-w-xs" />
          <FilterGroup options={statuses} value={statusFilter} onChange={setStatusFilter} />
          <FilterGroup options={priorities} value={priorityFilter} onChange={setPriorityFilter} />
          <FilterGroup options={serviceFilters} value={serviceFilter} onChange={setServiceFilter} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelected(project.id === selected ? null : project.id)}
              className={cn(
                'bg-card border rounded-xl p-4 cursor-pointer hover:border-border/80 hover:bg-card/80 transition-all group',
                project.id === selected ? 'border-primary/40 bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{project.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{project.client}</p>
                </div>
                <PriorityBadge priority={project.priority} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={project.status} />
                <BadgePill tone={serviceTone[project.service]} uppercase={false} className="px-1.5 py-0.5 text-[10px]">
                  {serviceLabelMap[project.service]}
                </BadgePill>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">İlerleme</span>
                  <span className="text-sm font-semibold text-foreground">%{project.progress}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      project.progress === 100
                        ? 'bg-emerald-500'
                        : project.progress > 60
                          ? 'bg-primary'
                          : project.progress > 30
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    )}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Teslim: {project.deadline}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  {formatCurrency(project.budget)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">Filtrelere uygun proje yok</p>
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="w-full xl:w-[380px] border-l border-border bg-card overflow-y-auto shrink-0">
          <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
            <h3 className="text-base font-semibold text-foreground">Proje Detayı</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <h4 className="font-bold text-foreground text-base">{selectedProject.name}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{selectedProject.client}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={selectedProject.status} />
                <PriorityBadge priority={selectedProject.priority} />
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed bg-secondary rounded-lg p-3 border border-border">
              {selectedProject.description}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Bütçe</p>
                <p className="text-base font-bold text-foreground">{formatCurrency(selectedProject.budget)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">İlerleme</p>
                <p className="text-base font-bold text-foreground">%{selectedProject.progress}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Başlangıç Tarihi</p>
                <p className="text-sm font-semibold text-foreground">{selectedProject.startDate}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Teslim Tarihi</p>
                <p className="text-sm font-semibold text-foreground">{selectedProject.deadline}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Genel İlerleme</span>
                <span className="font-semibold text-foreground">%{selectedProject.progress}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${selectedProject.progress}%` }} />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Görevler ({projectTasks.length})</p>
              <div className="space-y-2">
                {projectTasks.length > 0 ? (
                  projectTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground">Teslim: {task.dueDate}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Bu proje için görev yok</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
