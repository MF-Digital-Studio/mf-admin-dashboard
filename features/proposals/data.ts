import type { PipelineStage, Proposal } from '@/types'

export const proposals = [
  {
    id: 'pr1',
    title: 'Mersin Oto Galeri - Tam Web + SEO',
    client: 'Mersin Oto Galeri',
    amount: 22000,
    sentDate: '2024-05-08',
    status: 'Sent',
    followUp: '2024-05-22',
  },
  {
    id: 'pr2',
    title: 'Delta Mimarlık - Portföy Sitesi',
    client: 'Delta Mimarlık',
    amount: 12500,
    sentDate: '2024-05-10',
    status: 'Under Review',
    followUp: '2024-05-20',
  },
  {
    id: 'pr3',
    title: 'Bodrum Butik - Sosyal Medya Eklentisi',
    client: 'Bodrum Butik Otel',
    amount: 6500,
    sentDate: '2024-05-05',
    status: 'Accepted',
    followUp: null,
  },
  {
    id: 'pr4',
    title: 'Ankara Gurme - Bakım Paketi',
    client: 'Ankara Gurme Restoran',
    amount: 3600,
    sentDate: '2024-04-25',
    status: 'Accepted',
    followUp: null,
  },
  {
    id: 'pr5',
    title: 'Konya Tekstil - Web Sitesi Yenileme',
    client: 'Konya Tekstil A.Ş.',
    amount: 18000,
    sentDate: '2024-04-10',
    status: 'Rejected',
    followUp: null,
  },
  {
    id: 'pr6',
    title: 'Yeni Müşteri - QR Menü Paketi',
    client: 'Pendik Cafe',
    amount: 4200,
    sentDate: null,
    status: 'Draft',
    followUp: '2024-05-19',
  },
] satisfies Proposal[]

export const pipelineStages = [
  { stage: 'Yeni Potansiyel', count: 2, value: 30500 },
  { stage: 'İletişim Kuruldu', count: 1, value: 8500 },
  { stage: 'Teklif Gönderildi', count: 2, value: 34500 },
  { stage: 'Müzakere', count: 1, value: 6500 },
  { stage: 'Kazanıldı', count: 4, value: 67500 },
  { stage: 'Kaybedildi', count: 1, value: 18000 },
] satisfies PipelineStage[]
