import type { FileCategory as PrismaFileCategory, StoredFile as PrismaStoredFile } from '@prisma/client'
import type { FileCategory, FileRecord, FileType } from '@/types'

const categoryToUi: Record<PrismaFileCategory, FileCategory> = {
  LOGOS: 'Logos',
  CONTRACTS: 'Contracts',
  ASSETS: 'Assets',
  DELIVERABLES: 'Deliverables',
  SCREENSHOTS: 'Screenshots',
  DOCUMENTS: 'Documents',
}

const categoryToPrisma: Record<FileCategory, PrismaFileCategory> = {
  Logos: 'LOGOS',
  Contracts: 'CONTRACTS',
  Assets: 'ASSETS',
  Deliverables: 'DELIVERABLES',
  Screenshots: 'SCREENSHOTS',
  Documents: 'DOCUMENTS',
}

const supportedTypes = new Set<FileType>(['pdf', 'jpg', 'png', 'ai', 'fig', 'zip', 'file'])

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`
  }

  const units = ['KB', 'MB', 'GB']
  let size = sizeBytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function toFileType(extension: string): FileType {
  const normalized = extension.toLowerCase() as FileType
  return supportedTypes.has(normalized) ? normalized : 'file'
}

export function mapFileCategoryToPrisma(value: FileCategory): PrismaFileCategory {
  return categoryToPrisma[value]
}

export function mapPrismaFileToFileRecord(
  file: PrismaStoredFile & {
    client: { id: string; companyName: string } | null
    project: { id: string; name: string } | null
  }
): FileRecord {
  return {
    id: file.id,
    name: file.name,
    category: categoryToUi[file.category],
    size: formatFileSize(file.sizeBytes),
    sizeBytes: file.sizeBytes,
    client: file.client?.companyName ?? '-',
    clientId: file.clientId,
    project: file.project?.name ?? '-',
    projectId: file.projectId,
    uploadedAt: toDateString(file.createdAt),
    updatedAt: toDateString(file.updatedAt),
    type: toFileType(file.extension),
    extension: file.extension,
    mimeType: file.mimeType,
    url: file.blobUrl,
    notes: file.notes ?? '',
  }
}
