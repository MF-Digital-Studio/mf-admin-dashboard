'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react'
import { PriorityBadge, StatusBadge } from '@/components/shared/badges'
import InlineSelect from '@/components/ui/inline-select'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog, type TaskFormValues } from '@/components/shared/create-entity-dialog'
import { emitDashboardDataRefresh } from '@/lib/dashboard-events'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { toast } from 'sonner'

const statusFilters = ['All', 'Todo', 'In Progress', 'Review', 'Done', 'Blocked']
const priorityFilters = ['All', 'High', 'Medium', 'Low']
const quickFilters = ['All', 'Due Today', 'Overdue', 'High Priority']

type TaskDetailsResponse = {
  task: Task
  editable: TaskFormValues
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [quickFilter, setQuickFilter] = useState('All')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [taskDetails, setTaskDetails] = useState<TaskDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmTask, setConfirmTask] = useState<null | { id: string; title: string }>(null)

  const today = todayIso()

  const loadTasks = useCallback(async () => {
    const data = await fetchJson<Task[]>('/api/tasks')
    setTasks(data)
  }, [])

  const loadTaskDetails = useCallback(async (taskId: string) => {
    const data = await fetchJson<TaskDetailsResponse>(`/api/tasks/${taskId}`)
    setTaskDetails(data)
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchJson<Task[]>('/api/tasks')
        if (mounted) {
          setTasks(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load tasks')
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

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const matchSearch =
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.project.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'All' || task.status === statusFilter
        const matchPriority = priorityFilter === 'All' || task.priority === priorityFilter

        let matchQuick = true
        if (quickFilter === 'Due Today') {
          matchQuick = task.dueDate === today
        }
        if (quickFilter === 'Overdue') {
          matchQuick = task.dueDate < today && task.status !== 'Done'
        }
        if (quickFilter === 'High Priority') {
          matchQuick = task.priority === 'High'
        }

        return matchSearch && matchStatus && matchPriority && matchQuick
      }),
    [priorityFilter, quickFilter, search, statusFilter, tasks, today]
  )

  const completed = tasks.filter((task) => task.status === 'Done').length
  const overdue = tasks.filter((task) => task.dueDate < today && task.status !== 'Done').length
  const review = tasks.filter((task) => task.status === 'Review').length

  const statusIcon: Record<string, ReactElement> = {
    Done: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    'In Progress': <Circle className="w-3.5 h-3.5 text-blue-400" />,
    Todo: <Circle className="w-3.5 h-3.5 text-muted-foreground" />,
    Review: <Clock className="w-3.5 h-3.5 text-purple-400" />,
    Blocked: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  }

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null
  const activeEditableValues: TaskFormValues | undefined = taskDetails?.editable
    ? taskDetails.editable
    : activeTask
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

  const handleCreateTask = async (payload: TaskFormValues) => {
    setError(null)
    try {
      await fetchJson('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await loadTasks()
      toast.success('Görev oluşturuldu')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      setError(message)
      throw err
    }
  }

  const handleUpdateTask = async (payload: TaskFormValues) => {
    if (!activeTaskId) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/tasks/${activeTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      await Promise.all([loadTasks(), loadTaskDetails(activeTaskId)])
      toast.success('Görev güncellendi')
      emitDashboardDataRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      throw err
    }
  }

  const handleDeleteTask = async (task: Task) => {
    setConfirmTask({ id: task.id, title: task.title })
  }

  const doDeleteTask = async (id: string) => {
    setConfirmTask(null)
    setError(null)
    try {
      await fetchJson(`/api/tasks/${id}`, { method: 'DELETE' })
      if (activeTaskId === id) {
        setActiveTaskId(null)
        setTaskDetails(null)
      }
      await loadTasks()
      toast.success('Görev silindi')
      emitDashboardDataRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const openEdit = async (taskId: string) => {
    setActiveTaskId(taskId)
    setError(null)
    try {
      await loadTaskDetails(taskId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task details')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        title="Görevler"
        description={`${tasks.length} toplam görev`}
        action={
          <CreateEntityDialog
            entity="task"
            trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Görev</Button>}
            onTaskSubmit={handleCreateTask}
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tamamlanan</span>
          </div>
          <p className="text-xl font-bold text-foreground">{completed}</p>
          <p className="text-sm text-muted-foreground">bu hafta</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Geciken</span>
          </div>
          <p className="text-xl font-bold text-foreground">{overdue}</p>
          <p className="text-sm text-muted-foreground">aksiyon gerekli</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">İncelemede</span>
          </div>
          <p className="text-xl font-bold text-foreground">{review}</p>
          <p className="text-sm text-muted-foreground">onay bekliyor</p>
        </div>
      </div>

      <div className="space-y-2">
        <SearchField value={search} onChange={setSearch} placeholder="Görev ara..." className="max-w-xs" />
        <FilterGroup options={quickFilters} value={quickFilter} onChange={setQuickFilter} />
        <FilterGroup options={statusFilters} value={statusFilter} onChange={setStatusFilter} />
        <FilterGroup options={priorityFilters} value={priorityFilter} onChange={setPriorityFilter} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <TableWrapper title="Görevler" description="İş kuyruğu ve teslim takibi">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {['', 'Görev', 'Proje', 'Atanan', 'Öncelik', 'Durum', 'Teslim Tarihi', 'İşlemler'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap first:w-8">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                filtered.map((task, index) => {
                  const isOverdue = task.dueDate < today && task.status !== 'Done'

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        'border-b border-border/50 hover:bg-secondary/40 transition-colors',
                        index === filtered.length - 1 && 'border-0',
                        isOverdue && 'bg-red-500/5'
                      )}
                    >
                      <td className="px-4 py-3">
                        {statusIcon[task.status] ?? <Circle className="w-3.5 h-3.5 text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3">
                        <p className={cn('font-medium', task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground')}>
                          {task.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{task.project}</td>
                      <td className="px-4 py-3 text-muted-foreground">{task.assignedTo}</td>
                      <td className="px-4 py-3">
                        <InlineSelect
                          value={task.priority}
                          options={[{ value: 'High', label: 'Yüksek' }, { value: 'Medium', label: 'Orta' }, { value: 'Low', label: 'Düşük' }]}
                          onChange={async (val) => {
                            await fetchJson(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priority: val }) })
                            await loadTasks()
                            toast.success('Öncelik güncellendi')
                            emitDashboardDataRefresh()
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InlineSelect
                          value={task.status}
                          options={[{ value: 'Todo', label: 'Yapılacak' }, { value: 'In Progress', label: 'Devam Ediyor' }, { value: 'Review', label: 'İncelemede' }, { value: 'Done', label: 'Tamamlandı' }, { value: 'Blocked', label: 'Engelli' }]}
                          onChange={async (val) => {
                            await fetchJson(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: val }) })
                            await loadTasks()
                            toast.success('Durum güncellendi')
                            emitDashboardDataRefresh()
                          }}
                        />
                      </td>
                      <td className={cn('px-4 py-3 font-medium whitespace-nowrap', isOverdue ? 'text-red-400' : 'text-muted-foreground')}>
                        {isOverdue && <AlertCircle className="w-3 h-3 inline-block mr-1 text-red-400" />}
                        {task.dueDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <CreateEntityDialog
                            entity="task"
                            mode="edit"
                            taskInitialValues={activeTaskId === task.id ? activeEditableValues : {
                              title: task.title,
                              projectId: task.projectId,
                              assignedTo: task.assignedTo,
                              priority: task.priority,
                              status: task.status,
                              dueDate: task.dueDate === '-' ? '' : task.dueDate,
                              notes: task.notes ?? '',
                            }}
                            onTaskSubmit={handleUpdateTask}
                            trigger={
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-border px-2"
                                onClick={() => {
                                  void openEdit(task.id)
                                }}
                              >
                                Düzenle
                              </Button>
                            }
                          />
                          <Button size="sm" variant="outline" className="h-7 border-red-500/30 px-2 text-red-300 hover:bg-red-500/10" onClick={() => void handleDeleteTask(task)}>
                            Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        {isLoading && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Görevler yükleniyor...</p>
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Görev bulunamadı</p>
          </div>
        )}
      </TableWrapper>
      {confirmTask && (
        <ConfirmDialog
          open={Boolean(confirmTask)}
          title="Görevi sil"
          description={`"${confirmTask?.title}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmLabel="Sil"
          cancelLabel="İptal"
          onClose={(confirmed) => {
            if (confirmed && confirmTask) void doDeleteTask(confirmTask.id)
            else setConfirmTask(null)
          }}
        />
      )}
    </div>
  )
}
