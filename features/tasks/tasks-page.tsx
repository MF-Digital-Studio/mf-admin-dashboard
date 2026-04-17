'use client'

import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react'
import { tasks } from '@/features/tasks/data'
import { PriorityBadge, StatusBadge } from '@/components/shared/badges'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'

const statusFilters = ['All', 'Todo', 'In Progress', 'Review', 'Done', 'Blocked']
const priorityFilters = ['All', 'High', 'Medium', 'Low']
const quickFilters = ['All', 'Due Today', 'Overdue', 'High Priority']
const today = '2024-05-16'

export function TasksPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [quickFilter, setQuickFilter] = useState('All')

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const matchSearch =
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.project.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'All' || task.status === statusFilter
        const matchPriority = priorityFilter === 'All' || task.priority === priorityFilter

        let matchQuick = true
        if (quickFilter === 'Due Today') matchQuick = task.dueDate === today
        if (quickFilter === 'Overdue') matchQuick = task.dueDate < today && task.status !== 'Done'
        if (quickFilter === 'High Priority') matchQuick = task.priority === 'High'

        return matchSearch && matchStatus && matchPriority && matchQuick
      }),
    [priorityFilter, quickFilter, search, statusFilter]
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

  return (
    <div className="p-4 sm:p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        title="Görevler"
        description={`${tasks.length} toplam görev`}
        action={<CreateEntityDialog entity="task" trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Görev</Button>} />}
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

      <TableWrapper title="Görevler" description="İş kuyruğu ve teslim takibi">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {['', 'Görev', 'Proje', 'Atanan', 'Öncelik', 'Durum', 'Teslim Tarihi'].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap first:w-8">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, index) => {
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
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className={cn('px-4 py-3 font-medium whitespace-nowrap', isOverdue ? 'text-red-400' : 'text-muted-foreground')}>
                      {isOverdue && <AlertCircle className="w-3 h-3 inline-block mr-1 text-red-400" />}
                      {task.dueDate}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Görev bulunamadı</p>
          </div>
        )}
      </TableWrapper>
    </div>
  )
}
