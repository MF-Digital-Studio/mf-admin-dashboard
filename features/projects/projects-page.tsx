'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, DollarSign, X } from 'lucide-react'
import { BadgePill, PriorityBadge, StatusBadge } from '@/components/shared/badges'
import InlineSelect from '@/components/ui/inline-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog, type ProjectFormValues, type TaskFormValues } from '@/components/shared/create-entity-dialog'
import { emitDashboardDataRefresh } from '@/lib/dashboard-events'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { Project, ServiceName, Task } from '@/types'
import { toast } from 'sonner'

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

type ProjectDetailsResponse = {
  project: Project
  editable: ProjectFormValues
  tasks: Task[]
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedDetails, setSelectedDetails] = useState<ProjectDetailsResponse | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmProject, setConfirmProject] = useState<null | { id: string; name: string }>(null)

  const loadProjects = useCallback(async () => {
    const data = await fetchJson<Project[]>('/api/projects')
    setProjects(data)
  }, [])

  const loadProjectDetails = useCallback(async (id: string) => {
    setIsDetailLoading(true)
    try {
      const data = await fetchJson<ProjectDetailsResponse>(`/api/projects/${id}`)
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
        const data = await fetchJson<Project[]>('/api/projects')
        if (mounted) {
          setProjects(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load projects')
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
    void loadProjectDetails(selected).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load project details')
    })
  }, [loadProjectDetails, selected])

  const filtered = useMemo(
    () =>
      projects.filter((project) => {
        const matchSearch = project.name.toLowerCase().includes(search.toLowerCase()) || project.client.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'All' || project.status === statusFilter
        const matchPriority = priorityFilter === 'All' || project.priority === priorityFilter
        const matchService = serviceFilter === 'All' || project.service === serviceFilter
        return matchSearch && matchStatus && matchPriority && matchService
      }),
    [priorityFilter, projects, search, serviceFilter, statusFilter]
  )

  const selectedProject = selectedDetails?.project ?? projects.find((project) => project.id === selected) ?? null
  const projectTasks = selectedDetails?.tasks ?? []

  const selectedEditableValues: ProjectFormValues | undefined = selectedDetails?.editable
    ? selectedDetails.editable
    : selectedProject
      ? {
        name: selectedProject.name,
        clientId: selectedProject.clientId,
        service: selectedProject.service,
        status: selectedProject.status,
        priority: selectedProject.priority,
        budget: selectedProject.budget,
        startDate: selectedProject.startDate === '-' ? '' : selectedProject.startDate,
        deadline: selectedProject.deadline === '-' ? '' : selectedProject.deadline,
        description: selectedProject.description ?? '',
      }
      : undefined

  const activeTask = projectTasks.find((task) => task.id === activeTaskId) ?? null
  const activeTaskEditableValues: TaskFormValues | undefined = activeTask
    ? {
      title: activeTask.title,
      projectId: activeTask.projectId,
      assignedTo: activeTask.assignedTo,
      priority: activeTask.priority,
      status: activeTask.status,
      dueDate: activeTask.dueDate === '-' ? '' : activeTask.dueDate,
      notes: activeTask.notes ?? '',
    }
    : undefined

  const handleCreateProject = async (payload: ProjectFormValues) => {
    setError(null)
    try {
      await fetchJson('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await loadProjects()
      toast.success('Proje oluşturuldu')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project'
      setError(message)
      throw err
    }
  }

  const handleUpdateProject = async (payload: ProjectFormValues) => {
    if (!selected) return
    setError(null)
    try {
      await fetchJson(`/api/projects/${selected}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await Promise.all([loadProjects(), loadProjectDetails(selected)])
      toast.success('Proje güncellendi')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project'
      setError(message)
      throw err
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return
    setConfirmProject({ id: selectedProject.id, name: selectedProject.name })
  }

  const doDeleteProject = async (id: string) => {
    setConfirmProject(null)
    setError(null)
    try {
      await fetchJson(`/api/projects/${id}`, { method: 'DELETE' })
      setSelected(null)
      setSelectedDetails(null)
      await loadProjects()
      toast.success('Proje silindi')
      emitDashboardDataRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const handleCreateSubtask = async (payload: TaskFormValues) => {
    if (!selectedProject) return
    setError(null)
    try {
      await fetchJson('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, projectId: selectedProject.id }),
      })
      await Promise.all([loadProjects(), loadProjectDetails(selectedProject.id)])
      toast.success('Alt görev oluşturuldu')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create subtask'
      setError(message)
      throw err
    }
  }

  const handleUpdateSubtask = async (payload: TaskFormValues) => {
    if (!activeTaskId) return
    setError(null)
    try {
      await fetchJson(`/api/tasks/${activeTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (selectedProject) {
        await Promise.all([loadProjects(), loadProjectDetails(selectedProject.id)])
      } else {
        await loadProjects()
      }
      toast.success('Alt görev güncellendi')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update subtask'
      setError(message)
      throw err
    }
  }

  const handleDeleteSubtask = async (taskId: string) => {
    setError(null)
    try {
      await fetchJson(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (selectedProject) {
        await Promise.all([loadProjects(), loadProjectDetails(selectedProject.id)])
      } else {
        await loadProjects()
      }
      toast.success('Alt görev silindi')
      emitDashboardDataRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subtask')
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className={cn('flex-1 overflow-y-auto p-4 sm:p-6 space-y-5', selected && 'hidden xl:block')}>
        <PageHeader
          title="Projeler"
          description={`${projects.length} toplam proje`}
          action={
            <CreateEntityDialog
              entity="project"
              trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Proje</Button>}
              onProjectSubmit={handleCreateProject}
            />
          }
        />

        <div className="space-y-2">
          <SearchField value={search} onChange={setSearch} placeholder="Proje ara..." className="max-w-xs" />
          <FilterGroup options={statuses} value={statusFilter} onChange={setStatusFilter} />
          <FilterGroup options={priorities} value={priorityFilter} onChange={setPriorityFilter} />
          <FilterGroup options={serviceFilters} value={serviceFilter} onChange={setServiceFilter} />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
          {!isLoading &&
            filtered.map((project) => (
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
                  <InlineSelect
                    value={project.priority}
                    options={[{ value: 'High', label: 'Yüksek' }, { value: 'Medium', label: 'Orta' }, { value: 'Low', label: 'Düşük' }]}
                    onChange={async (val) => {
                      await fetchJson(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priority: val }) })
                      await loadProjects()
                      toast.success('Öncelik güncellendi')
                      emitDashboardDataRefresh()
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <InlineSelect
                    value={project.status}
                    options={[{ value: 'Planning', label: 'Planlama' }, { value: 'Design', label: 'Tasarım' }, { value: 'Development', label: 'Geliştirme' }, { value: 'Revision', label: 'Revizyon' }, { value: 'Waiting for Client', label: 'Bekliyor' }, { value: 'Completed', label: 'Tamamlandı' }, { value: 'On Hold', label: 'Beklemede' }]}
                    onChange={async (val) => {
                      await fetchJson(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: val }) })
                      await loadProjects()
                      toast.success('Durum güncellendi')
                      emitDashboardDataRefresh()
                    }}
                  />
                  <BadgePill tone={serviceTone[project.service]} uppercase={false} className="px-1.5 py-0.5 text-[10px]">
                    {serviceLabelMap[project.service]}
                  </BadgePill>
                </div>

                <div className="mb-3 text-sm text-muted-foreground">
                  Alt görevler: {project.completedTaskCount}/{project.taskCount}
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

        {isLoading && <div className="py-20 text-center"><p className="text-sm text-muted-foreground">Projeler yükleniyor...</p></div>}
        {!isLoading && filtered.length === 0 && <div className="py-20 text-center"><p className="text-sm text-muted-foreground">Filtrelere uygun proje yok</p></div>}
      </div>

      {selectedProject && (
        <div className="w-full xl:w-[420px] border-l border-border bg-card overflow-y-auto shrink-0">
          <div className="sticky top-0 bg-card border-b border-border px-5 py-4 z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Proje Detayı</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              <CreateEntityDialog
                entity="project"
                mode="edit"
                projectInitialValues={selectedEditableValues}
                onProjectSubmit={handleUpdateProject}
                trigger={<Button size="sm" variant="outline" className="h-8 border-border">Düzenle</Button>}
              />
              <Button size="sm" variant="outline" className="h-8 border-red-500/30 text-red-300 hover:bg-red-500/10" onClick={handleDeleteProject}>
                Sil
              </Button>
            </div>
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
              {selectedProject.description || 'Açıklama yok'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Bütçe</p>
                <p className="text-base font-bold text-foreground">{formatCurrency(selectedProject.budget)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Alt Görevler</p>
                <p className="text-base font-bold text-foreground">{selectedProject.completedTaskCount}/{selectedProject.taskCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Başlangıç</p>
                <p className="text-sm font-semibold text-foreground">{selectedProject.startDate}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">Teslim</p>
                <p className="text-sm font-semibold text-foreground">{selectedProject.deadline}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Alt Görevler ({projectTasks.length})</p>
                <CreateEntityDialog
                  entity="task"
                  onTaskSubmit={handleCreateSubtask}
                  taskInitialValues={{
                    title: '',
                    projectId: selectedProject.id,
                    assignedTo: 'Admin',
                    priority: 'Medium',
                    status: 'Todo',
                    dueDate: '',
                    notes: '',
                  }}
                  trigger={<Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">+ Alt Görev</Button>}
                />
              </div>
              <div className="space-y-2">
                {isDetailLoading ? (
                  <p className="text-sm text-muted-foreground">Detaylar yükleniyor...</p>
                ) : projectTasks.length > 0 ? (
                  projectTasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-lg bg-secondary border border-border space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <InlineSelect
                          value={task.status}
                          options={[{ value: 'Todo', label: 'Yapılacak' }, { value: 'In Progress', label: 'Devam' }, { value: 'Review', label: 'İncelemede' }, { value: 'Done', label: 'Tamamlandı' }, { value: 'Blocked', label: 'Engelli' }]}
                          onChange={async (val) => {
                            await fetchJson(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: val }) })
                            if (selectedProject) await Promise.all([loadProjects(), loadProjectDetails(selectedProject.id)])
                            toast.success('Durum güncellendi')
                            emitDashboardDataRefresh()
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Teslim: {task.dueDate}</span>
                        <span>Atanan: {task.assignedTo}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <CreateEntityDialog
                          entity="task"
                          mode="edit"
                          taskInitialValues={activeTaskId === task.id ? activeTaskEditableValues : {
                            title: task.title,
                            projectId: task.projectId,
                            assignedTo: task.assignedTo,
                            priority: task.priority,
                            status: task.status,
                            dueDate: task.dueDate === '-' ? '' : task.dueDate,
                            notes: task.notes ?? '',
                          }}
                          onTaskSubmit={handleUpdateSubtask}
                          trigger={
                            <Button size="sm" variant="outline" className="h-7 border-border px-2 text-xs" onClick={() => setActiveTaskId(task.id)}>
                              Düzenle
                            </Button>
                          }
                        />
                        <Button size="sm" variant="outline" className="h-7 border-red-500/30 px-2 text-xs text-red-300 hover:bg-red-500/10" onClick={() => void handleDeleteSubtask(task.id)}>
                          Sil
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Bu proje için alt görev yok</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmProject && (
        <ConfirmDialog
          open={Boolean(confirmProject)}
          title="Projeyi sil"
          description={`"${confirmProject?.name}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmLabel="Sil"
          cancelLabel="İptal"
          onClose={(confirmed) => {
            if (confirmed && confirmProject) void doDeleteProject(confirmProject.id)
            else setConfirmProject(null)
          }}
        />
      )}
    </div>
  )
}
