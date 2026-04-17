export type NoteCategory = 'Client Notes' | 'Meeting Notes' | 'Internal Ideas' | 'Revision Requests'
export type NoteRelatedType = 'client' | 'internal'

export interface Note {
  id: string
  title: string
  category: NoteCategory
  related: string | null
  relatedType: NoteRelatedType
  content: string
  updatedAt: string
  tags: string[]
}

