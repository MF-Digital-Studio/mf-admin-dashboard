import type { ActivityItem } from '@/types'
import { projects } from '@/features/projects/data'

export const activities = [
  { id: 'a1', action: 'Ödeme alındı', detail: '₺19.000 - Bodrum Butik Otel', time: '2 saat önce', type: 'payment' },
  { id: 'a2', action: 'Görev tamamlandı', detail: 'QR Menü İçerik Güncelleme - Ankara Gurme', time: '4 saat önce', type: 'task' },
  { id: 'a3', action: 'Teklif kabul edildi', detail: 'Bodrum Butik - Sosyal Medya Eklentisi', time: '1 gün önce', type: 'proposal' },
  { id: 'a4', action: 'Yeni müşteri eklendi', detail: 'Mersin Oto Galeri - Potansiyel', time: '2 gün önce', type: 'client' },
  { id: 'a5', action: 'Proje güncellendi', detail: 'İstanbul Mode - E-ticaret %70', time: '2 gün önce', type: 'project' },
  { id: 'a7', action: 'Fatura gönderildi', detail: 'Trabzon Balık Evi - ₺3.500', time: '4 gün önce', type: 'payment' },
] satisfies ActivityItem[]

export const projectStatusData = [
  { name: 'Planlama', value: projects.filter((project) => project.status === 'Planning').length, fill: '#64748b' },
  { name: 'Tasarım', value: projects.filter((project) => project.status === 'Design').length, fill: '#a855f7' },
  { name: 'Geliştirme', value: projects.filter((project) => project.status === 'Development').length, fill: '#3b82f6' },
  { name: 'Revizyon', value: projects.filter((project) => project.status === 'Revision').length, fill: '#f97316' },
  { name: 'Bekleyen', value: projects.filter((project) => project.status === 'Waiting for Client').length, fill: '#eab308' },
  { name: 'Tamamlandı', value: projects.filter((project) => project.status === 'Completed').length, fill: '#22c55e' },
] satisfies Array<{ name: string; value: number; fill: string }>
