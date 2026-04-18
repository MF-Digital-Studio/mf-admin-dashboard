import type { Note as PrismaNoteModel, NoteCategory as PrismaNoteCategory, NoteRelatedType as PrismaNoteRelatedType } from '@prisma/client'
import type { Note, NoteCategory, NoteRelatedType } from '@/types'

const categoryToUi: Record<PrismaNoteCategory, NoteCategory> = {
  CLIENT_NOTES: 'Client Notes',
  MEETING_NOTES: 'Meeting Notes',
  INTERNAL_IDEAS: 'Internal Ideas',
  REVISION_REQUESTS: 'Revision Requests',
}

const categoryToPrisma: Record<NoteCategory, PrismaNoteCategory> = {
  'Client Notes': 'CLIENT_NOTES',
  'Meeting Notes': 'MEETING_NOTES',
  'Internal Ideas': 'INTERNAL_IDEAS',
  'Revision Requests': 'REVISION_REQUESTS',
}

const relatedTypeToUi: Record<PrismaNoteRelatedType, NoteRelatedType> = {
  CLIENT: 'client',
  PROJECT: 'project',
  INTERNAL: 'internal',
}

const relatedTypeToPrisma: Record<NoteRelatedType, PrismaNoteRelatedType> = {
  client: 'CLIENT',
  project: 'PROJECT',
  internal: 'INTERNAL',
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function mapNoteCategoryToPrisma(value: NoteCategory): PrismaNoteCategory {
  return categoryToPrisma[value]
}

export function mapNoteRelatedTypeToPrisma(value: NoteRelatedType): PrismaNoteRelatedType {
  return relatedTypeToPrisma[value]
}

export function mapPrismaNoteToNote(
  note: PrismaNoteModel & {
    client: { id: string; companyName: string } | null
    project: { id: string; name: string } | null
  }
): Note {
  return {
    id: note.id,
    title: note.title,
    category: categoryToUi[note.category],
    related:
      note.relatedType === 'CLIENT'
        ? note.client?.companyName ?? null
        : note.relatedType === 'PROJECT'
          ? note.project?.name ?? null
          : null,
    relatedType: relatedTypeToUi[note.relatedType],
    clientId: note.clientId,
    projectId: note.projectId,
    content: note.content,
    updatedAt: toDateString(note.updatedAt),
    tags: note.tags,
  }
}

export function mapPrismaNoteToEditable(note: PrismaNoteModel) {
  return {
    title: note.title,
    category: categoryToUi[note.category],
    relatedType: relatedTypeToUi[note.relatedType],
    clientId: note.clientId ?? '',
    projectId: note.projectId ?? '',
    content: note.content,
    tags: note.tags,
  }
}
