'use client'

import { useMemo, useState } from 'react'
import { Lightbulb, MessageSquare, RefreshCw, StickyNote, Users } from 'lucide-react'
import { notes } from '@/features/notes/data'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'

const categories = ['All', 'Client Notes', 'Meeting Notes', 'Internal Ideas', 'Revision Requests']

const categoryLabelMap: Record<string, string> = {
  'Client Notes': 'Müşteri Notları',
  'Meeting Notes': 'Toplantı Notları',
  'Internal Ideas': 'İç Fikirler',
  'Revision Requests': 'Revizyon Talepleri',
}

const categoryIcon: Record<string, any> = {
  'Client Notes': Users,
  'Meeting Notes': MessageSquare,
  'Internal Ideas': Lightbulb,
  'Revision Requests': RefreshCw,
}

const categoryColor: Record<string, string> = {
  'Client Notes': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Meeting Notes': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Internal Ideas': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'Revision Requests': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

const categoryBg: Record<string, string> = {
  'Client Notes': 'border-l-blue-500/50',
  'Meeting Notes': 'border-l-emerald-500/50',
  'Internal Ideas': 'border-l-yellow-500/50',
  'Revision Requests': 'border-l-orange-500/50',
}

export function NotesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const filtered = useMemo(
    () =>
      notes.filter((note) => {
        const matchSearch =
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase())
        const matchCategory = categoryFilter === 'All' || note.category === categoryFilter

        return matchSearch && matchCategory
      }),
    [categoryFilter, search]
  )

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        title="Notlar"
        description="İç CRM notları ve fikir havuzu"
        action={<CreateEntityDialog entity="note" trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Not</Button>} />}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchField value={search} onChange={setSearch} placeholder="Not ara..." className="flex-1 max-w-xs" />
        <FilterGroup options={categories} value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((note) => {
          const Icon = categoryIcon[note.category] ?? StickyNote
          const borderColor = categoryBg[note.category] ?? 'border-l-border'
          const chipColor = categoryColor[note.category] ?? 'text-muted-foreground bg-secondary border-border'

          return (
            <div
              key={note.id}
              className={cn('bg-card border border-border border-l-2 rounded-xl p-4 hover:bg-card/80 cursor-pointer transition-all group', borderColor)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-foreground leading-snug flex-1">{note.title}</h4>
                <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0', chipColor)}>
                  <Icon className="w-2.5 h-2.5" />
                  {categoryLabelMap[note.category] ?? note.category}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">{note.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground shrink-0 ml-2">{note.updatedAt}</span>
              </div>

              {note.related && (
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">İlişkili: </span>
                  <span className="text-sm text-foreground font-medium">{note.related}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <StickyNote className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">Not bulunamadı</p>
        </div>
      )}
    </div>
  )
}
