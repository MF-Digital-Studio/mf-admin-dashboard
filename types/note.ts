export type NoteCategory = 'Client Notes' | 'Meeting Notes' | 'Internal Ideas' | 'Revision Requests'
export type NoteRelatedType = 'client' | 'project' | 'internal'

export interface Note {
  id: string
  title: string
  category: NoteCategory
  related: string | null
  relatedType: NoteRelatedType
  clientId?: string | null
  projectId?: string | null
  content: string
  updatedAt: string
  tags: string[]
}
