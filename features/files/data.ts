import type { FileRecord } from '@/types'

export const files = [
  { id: 'f1', name: 'bodrum-butik-logo-v3.ai', category: 'Logos', size: '2.4 MB', client: 'Bodrum Butik Otel', project: 'Bodrum Butik - Tam Paket', uploadedAt: '2024-05-14', type: 'ai' },
  { id: 'f2', name: 'istanbul-mode-contract-signed.pdf', category: 'Contracts', size: '340 KB', client: 'İstanbul Mode Store', project: 'İstanbul Mode - E-ticaret', uploadedAt: '2024-05-13', type: 'pdf' },
  { id: 'f3', name: 'ankara-gurme-homepage-mockup.fig', category: 'Assets', size: '8.1 MB', client: 'Ankara Gurme Restoran', project: 'Ankara Gurme - Web Yenileme', uploadedAt: '2024-05-12', type: 'fig' },
  { id: 'f4', name: 'bursa-hukuk-seo-report-may.pdf', category: 'Documents', size: '520 KB', client: 'Bursa Hukuk Bürosu', project: 'Bursa Hukuk - SEO Kampanyası', uploadedAt: '2024-05-11', type: 'pdf' },
  { id: 'f5', name: 'bodrum-butik-hero-final.jpg', category: 'Deliverables', size: '4.2 MB', client: 'Bodrum Butik Otel', project: 'Bodrum Butik - Tam Paket', uploadedAt: '2024-05-10', type: 'jpg' },
  { id: 'f6', name: 'ankara-gurme-qr-menu-v2.pdf', category: 'Deliverables', size: '1.1 MB', client: 'Ankara Gurme Restoran', project: 'Ankara Gurme - QR Menü v2', uploadedAt: '2024-05-09', type: 'pdf' },
  { id: 'f7', name: 'konya-tekstil-final-store.zip', category: 'Deliverables', size: '22.3 MB', client: 'Konya Tekstil A.Ş.', project: 'Konya Tekstil - SEO ve Mağaza', uploadedAt: '2024-03-01', type: 'zip' },
  { id: 'f8', name: 'bodrum-butik-screenshot-mobile.png', category: 'Screenshots', size: '890 KB', client: 'Bodrum Butik Otel', project: 'Bodrum Butik - Tam Paket', uploadedAt: '2024-05-08', type: 'png' },
] satisfies FileRecord[]
