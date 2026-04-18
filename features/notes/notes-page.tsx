'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Lightbulb, MessageSquare, RefreshCw, StickyNote, Users } from 'lucide-react'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog, type NoteFormValues } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

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

type NotesDetailResponse = {
  note: Note
  editable: NoteFormValues
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }

  return (await response.json()) as T
}

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [noteDetails, setNoteDetails] = useState<NotesDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadNotes = useCallback(async () => {
    const data = await fetchJson<Note[]>('/api/notes')
    setNotes(data)
  }, [])

  const loadNoteDetails = useCallback(async (id: string) => {
    const data = await fetchJson<NotesDetailResponse>(`/api/notes/${id}`)
    setNoteDetails(data)
  }, [])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchJson<Note[]>('/api/notes')
        if (mounted) {
          setNotes(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load notes')
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
      notes.filter((note) => {
        const matchSearch =
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase())
        const matchCategory = categoryFilter === 'All' || note.category === categoryFilter

        return matchSearch && matchCategory
      }),
    [categoryFilter, notes, search]
  )

  const activeNote = notes.find((note) => note.id === activeNoteId) ?? null
  const activeEditableValues: NoteFormValues | undefined = noteDetails?.editable
    ? noteDetails.editable
    : activeNote
      ? {
          title: activeNote.title,
          category: activeNote.category,
          relatedType: activeNote.relatedType,
          clientId: activeNote.clientId ?? '',
          projectId: activeNote.projectId ?? '',
          content: activeNote.content,
          tags: activeNote.tags,
        }
      : undefined

  const handleCreateNote = async (payload: NoteFormValues) => {
    setError(null)
    try {
      await fetchJson('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await loadNotes()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note'
      setError(message)
      throw err
    }
  }

  const handleUpdateNote = async (payload: NoteFormValues) => {
    if (!activeNoteId) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/notes/${activeNoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await Promise.all([loadNotes(), loadNoteDetails(activeNoteId)])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note'
      setError(message)
      throw err
    }
  }

  const handleDeleteNote = async (note: Note) => {
    const confirmed = window.confirm(`"${note.title}" notunu silmek istiyor musunuz?`)
    if (!confirmed) {
      return
    }

    setError(null)
    try {
      await fetchJson(`/api/notes/${note.id}`, { method: 'DELETE' })
      if (activeNoteId === note.id) {
        setActiveNoteId(null)
        setNoteDetails(null)
      }
      await loadNotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  const openEdit = async (noteId: string) => {
    setActiveNoteId(noteId)
    setError(null)
    try {
      await loadNoteDetails(noteId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load note details')
    }
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        title="Notlar"
        description="İç CRM notları ve fikir havuzu"
        action={
          <CreateEntityDialog
            entity="note"
            trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">+ Yeni Not</Button>}
            onNoteSubmit={handleCreateNote}
          />
        }
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchField value={search} onChange={setSearch} placeholder="Not ara..." className="flex-1 max-w-xs" />
        <FilterGroup options={categories} value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {!isLoading &&
          filtered.map((note) => {
            const Icon = categoryIcon[note.category] ?? StickyNote
            const borderColor = categoryBg[note.category] ?? 'border-l-border'
            const chipColor = categoryColor[note.category] ?? 'text-muted-foreground bg-secondary border-border'

            return (
              <div
                key={note.id}
                className={cn('bg-card border border-border border-l-2 rounded-xl p-4 hover:bg-card/80 transition-all group', borderColor)}
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

                <div className="mt-3 pt-2 border-t border-border flex gap-1.5">
                  <CreateEntityDialog
                    entity="note"
                    mode="edit"
                    noteInitialValues={activeNoteId === note.id ? activeEditableValues : {
                      title: note.title,
                      category: note.category,
                      relatedType: note.relatedType,
                      clientId: note.clientId ?? '',
                      projectId: note.projectId ?? '',
                      content: note.content,
                      tags: note.tags,
                    }}
                    onNoteSubmit={handleUpdateNote}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-border px-2"
                        onClick={() => {
                          void openEdit(note.id)
                        }}
                      >
                        Düzenle
                      </Button>
                    }
                  />
                  <Button size="sm" variant="outline" className="h-7 border-red-500/30 px-2 text-red-300 hover:bg-red-500/10" onClick={() => void handleDeleteNote(note)}>
                    Sil
                  </Button>
                </div>
              </div>
            )
          })}
      </div>

      {isLoading && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Notlar yükleniyor...</p>
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <StickyNote className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">Not bulunamadı</p>
        </div>
      )}
    </div>
  )
}
