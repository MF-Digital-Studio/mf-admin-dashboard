export type FileCategory = 'Logos' | 'Contracts' | 'Assets' | 'Deliverables' | 'Screenshots' | 'Documents'
export type FileType = 'pdf' | 'jpg' | 'png' | 'ai' | 'fig' | 'zip' | 'file'

export interface FileRecord {
  id: string
  name: string
  category: FileCategory
  size: string
  sizeBytes: number
  client: string
  clientId?: string | null
  project: string
  projectId?: string | null
  uploadedAt: string
  updatedAt: string
  type: FileType
  extension: string
  mimeType: string
  url: string
  notes?: string
}
