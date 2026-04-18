import type { Expense, Payment } from '@/types'

export const monthlyRevenue = [
  { month: 'Kas', revenue: 18500, expenses: 5200 },
  { month: 'Ara', revenue: 22000, expenses: 6100 },
  { month: 'Oca', revenue: 19800, expenses: 5800 },
  { month: 'Şub', revenue: 31500, expenses: 7200 },
  { month: 'Mar', revenue: 28000, expenses: 6500 },
  { month: 'Nis', revenue: 35200, expenses: 8100 },
  { month: 'May', revenue: 41800, expenses: 9300 },
] satisfies Array<{ month: string; revenue: number; expenses: number }>

export const payments = [
  {
    id: 'pay1',
    client: 'Bodrum Butik Otel',
    clientId: 'c8',
    amount: 19000,
    date: '2024-05-14',
    category: 'Web Design',
    status: 'Paid',
    method: 'Banka Havalesi',
  },
  {
    id: 'pay2',
    client: 'İstanbul Mode Store',
    clientId: 'c2',
    amount: 14000,
    date: '2024-05-12',
    category: 'E-commerce',
    status: 'Paid',
    method: 'Banka Havalesi',
  },
  {
    id: 'pay3',
    client: 'Ankara Gurme Restoran',
    clientId: 'c1',
    amount: 7500,
    date: '2024-05-10',
    category: 'Web Design',
    status: 'Paid',
    method: 'Kredi Kartı',
  },
  {
    id: 'pay4',
    client: 'Bursa Hukuk Bürosu',
    clientId: 'c3',
    amount: 2000,
    date: '2024-05-09',
    category: 'SEO',
    status: 'Paid',
    method: 'EFT',
  },
  {
    id: 'pay5',
    client: 'Trabzon Balık Evi',
    clientId: 'c6',
    amount: 3500,
    date: '2024-05-20',
    category: 'QR Menu',
    status: 'Pending',
    method: 'Banka Havalesi',
  },
  {
    id: 'pay6',
    client: 'Mersin Oto Galeri',
    clientId: 'c7',
    amount: 8500,
    date: '2024-05-25',
    category: 'Web Design',
    status: 'Pending',
    method: 'Banka Havalesi',
  },
  {
    id: 'pay7',
    client: 'Delta Mimarlık',
    clientId: 'c4',
    amount: 5000,
    date: '2024-05-30',
    category: 'Web Design',
    status: 'Overdue',
    method: 'Banka Havalesi',
  },
] satisfies Payment[]

export const expenses = [
  { id: 'e1', name: 'Adobe Creative Suite', category: 'Yazılım', amount: 890, date: '2024-05-01' },
  { id: 'e2', name: 'Vercel Pro', category: 'Hosting', amount: 650, date: '2024-05-01' },
  { id: 'e3', name: 'SEMrush Aboneliği', category: 'Pazarlama Araçları', amount: 1200, date: '2024-05-03' },
  { id: 'e4', name: 'Ofis Kirası', category: 'Operasyon', amount: 4500, date: '2024-05-01' },
  { id: 'e5', name: 'Freelancer - UI Desteği', category: 'İş Gücü', amount: 2500, date: '2024-05-08' },
] satisfies Expense[]

export const expenseBreakdown = [
  { name: 'Operasyon', value: 4500 },
  { name: 'İş Gücü', value: 2500 },
  { name: 'Pazarlama Araçları', value: 1200 },
  { name: 'Yazılım', value: 890 },
  { name: 'Hosting', value: 650 },
] satisfies Array<{ name: string; value: number }>
