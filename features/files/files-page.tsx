'use client'

import { useMemo, useState } from 'react'
import { Archive, Download, FileCode, FileText, Image, MoreHorizontal, Upload } from 'lucide-react'
import { files } from '@/features/files/data'
import { FilterGroup } from '@/components/shared/filter-group'
import { PageHeader } from '@/components/shared/page-header'
import { SearchField } from '@/components/shared/search-field'
import { TableWrapper } from '@/components/shared/table-wrapper'
import { Button } from '@/components/ui/button'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'
import { cn } from '@/lib/utils'

const categories = ['All', 'Logos', 'Contracts', 'Assets', 'Deliverables', 'Screenshots', 'Documents']

const categoryLabels: Record<string, string> = {
  Logos: 'Logolar',
  Contracts: 'Sözleşmeler',
  Assets: 'Varlıklar',
  Deliverables: 'Teslimatlar',
  Screenshots: 'Ekran Görüntüleri',
  Documents: 'Belgeler',
}

const typeIcon: Record<string, any> = {
  pdf: FileText,
  jpg: Image,
  png: Image,
  ai: FileCode,
  fig: FileCode,
  zip: Archive,
}

const typeColor: Record<string, string> = {
  pdf: 'text-red-400 bg-red-500/10',
  jpg: 'text-yellow-400 bg-yellow-500/10',
  png: 'text-yellow-400 bg-yellow-500/10',
  ai: 'text-orange-400 bg-orange-500/10',
  fig: 'text-purple-400 bg-purple-500/10',
  zip: 'text-blue-400 bg-blue-500/10',
}

const categoryColor: Record<string, string> = {
  Logos: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Contracts: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Assets: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Deliverables: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Screenshots: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Documents: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export function FilesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const filtered = useMemo(
    () =>
      files.filter((file) => {
        const matchSearch =
          file.name.toLowerCase().includes(search.toLowerCase()) ||
          file.client.toLowerCase().includes(search.toLowerCase())
        const matchCategory = categoryFilter === 'All' || file.category === categoryFilter

        return matchSearch && matchCategory
      }),
    [categoryFilter, search]
  )

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        title="Dosyalar"
        description={`${files.length} toplam dosya`}
        action={<CreateEntityDialog entity="file" trigger={<Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"><Upload className="w-3.5 h-3.5" />Yükle</Button>} />}
      />

      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Son Yüklemeler</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {files.slice(0, 4).map((file) => {
            const Icon = typeIcon[file.type] ?? FileText
            const iconClass = typeColor[file.type] ?? 'text-muted-foreground bg-secondary'

            return (
              <div key={file.id} className="bg-card border border-border rounded-xl p-3 min-w-[180px] hover:border-border/80 transition-colors cursor-pointer">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-2', iconClass)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{file.size}</p>
                <p className="text-sm text-muted-foreground">{file.uploadedAt}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchField value={search} onChange={setSearch} placeholder="Dosya ara..." className="flex-1 max-w-xs" />
        <FilterGroup options={categories} value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <TableWrapper title="Dosya Arşivi">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {['Dosya', 'Kategori', 'Müşteri', 'Proje', 'Boyut', 'Yüklenme', ''].map((heading) => (
                  <th key={heading} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((file, index) => {
                const Icon = typeIcon[file.type] ?? FileText
                const iconClass = typeColor[file.type] ?? 'text-muted-foreground bg-secondary'
                const categoryClass = categoryColor[file.category] ?? 'bg-secondary text-muted-foreground border-border'

                return (
                  <tr key={file.id} className={cn('border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer', index === filtered.length - 1 && 'border-0')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconClass)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">{file.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border', categoryClass)}>
                        {categoryLabels[file.category] ?? file.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{file.client}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{file.project}</td>
                    <td className="px-4 py-3 text-muted-foreground">{file.size}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{file.uploadedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded hover:bg-secondary transition-colors" title="İndir">
                          <Download className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button className="p-1 rounded hover:bg-secondary transition-colors" title="Diğer">
                          <MoreHorizontal className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Dosya bulunamadı</p>
          </div>
        )}
      </TableWrapper>
    </div>
  )
}
