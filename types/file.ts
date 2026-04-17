export type FileCategory = 'Logos' | 'Contracts' | 'Assets' | 'Deliverables' | 'Screenshots' | 'Documents'
export type FileType = 'pdf' | 'jpg' | 'png' | 'ai' | 'fig' | 'zip'

export interface FileRecord {
  id: string
  name: string
  category: FileCategory
  size: string
  client: string
  project: string
  uploadedAt: string
  type: FileType
}

