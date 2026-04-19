'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ClientStatus, NoteCategory, NoteRelatedType, PaymentStatus, PriorityLevel, ProjectStatus, ProposalStatus, ServiceName, TaskStatus } from '@/types'
import type { SubscriptionBillingCycle } from '@/types'

export type CreateEntityType = 'client' | 'project' | 'task' | 'payment' | 'proposal' | 'subscription' | 'note' | 'invite'

interface CreateEntityDialogProps {
  entity: CreateEntityType
  trigger: ReactNode
  mode?: 'create' | 'edit'
  clientInitialValues?: ClientFormValues
  onClientSubmit?: (values: ClientFormValues) => Promise<void> | void
  projectInitialValues?: ProjectFormValues
  onProjectSubmit?: (values: ProjectFormValues) => Promise<void> | void
  taskInitialValues?: TaskFormValues
  onTaskSubmit?: (values: TaskFormValues) => Promise<void> | void
  proposalInitialValues?: ProposalFormValues
  onProposalSubmit?: (values: ProposalFormValues) => Promise<void> | void
  paymentInitialValues?: PaymentFormValues
  onPaymentSubmit?: (values: PaymentFormValues) => Promise<void> | void
  subscriptionInitialValues?: SubscriptionFormValues
  onSubscriptionSubmit?: (values: SubscriptionFormValues) => Promise<void> | void
  noteInitialValues?: NoteFormValues
  onNoteSubmit?: (values: NoteFormValues) => Promise<void> | void
}

export interface ClientFormValues {
  company: string
  contact: string
  phone: string
  location: string
  email: string
  instagram: string
  whatsapp: string
  website: string
  service: ServiceName
  status: ClientStatus
  notes: string
}

export interface ProjectFormValues {
  name: string
  clientId: string
  service: ServiceName
  status: ProjectStatus
  priority: PriorityLevel
  budget: number
  startDate: string
  deadline: string
  description: string
}

export interface TaskFormValues {
  title: string
  projectId: string
  assignedTo: string
  priority: PriorityLevel
  status: TaskStatus
  price?: number | null
  dueDate: string
  notes: string
}

export interface ProposalFormValues {
  title: string
  clientMode: 'existing' | 'new'
  clientId: string
  newClientCompany: string
  newClientContact: string
  newClientEmail: string
  newClientPhone: string
  newClientInstagram: string
  amount: number
  sentDate: string
  status: ProposalStatus
  followUp: string
  notes: string
}

export interface SubscriptionFormValues {
  name: string
  category: string
  billingCycle: SubscriptionBillingCycle
  amount: number
  renewalDate: string
  isActive: boolean
  notes: string
}

export interface PaymentFormValues {
  clientId: string
  projectId: string
  amount: number
  date: string
  category: ServiceName
  status: PaymentStatus
  method: string
  notes: string
}

export interface NoteFormValues {
  title: string
  category: NoteCategory
  relatedType: NoteRelatedType
  clientId: string
  projectId: string
  content: string
  tags: string[]
}

interface ProjectClientOption {
  id: string
  company: string
}

interface TaskProjectOption {
  id: string
  name: string
}

interface ProposalClientOption {
  id: string
  company: string
}

interface PaymentClientOption {
  id: string
  company: string
}

interface PaymentProjectOption {
  id: string
  name: string
  clientId: string
}

interface NoteClientOption {
  id: string
  company: string
}

interface NoteProjectOption {
  id: string
  name: string
}

const fieldLabelClass = 'text-sm font-medium text-muted-foreground'
const selectClass = 'h-9 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/40'

const formMeta: Record<CreateEntityType, { title: string; description: string; saveLabel: string }> = {
  client: {
    title: 'Müşteri Ekle',
    description: 'Yeni müşteri bilgisini ekleyin ve iş akışına dahil edin.',
    saveLabel: 'Müşteriyi Kaydet',
  },
  project: {
    title: 'Yeni Proje',
    description: 'Yeni bir proje oluşturup ekip planlamasına başlayın.',
    saveLabel: 'Projeyi Kaydet',
  },
  task: {
    title: 'Yeni Görev',
    description: 'Teslim takibini kolaylaştırmak için görev oluşturun.',
    saveLabel: 'Görevi Kaydet',
  },
  payment: {
    title: 'Yeni Ödeme',
    description: 'Ödeme kaydı ekleyerek finans akışını güncel tutun.',
    saveLabel: 'Ödemeyi Kaydet',
  },
  subscription: {
    title: 'Yeni Abonelik',
    description: 'Araç ve şirket abonelik giderini ekleyin.',
    saveLabel: 'Aboneliği Kaydet',
  },
  proposal: {
    title: 'Yeni Teklif',
    description: 'Müşteri için yeni teklif kaydı oluşturun.',
    saveLabel: 'Teklifi Kaydet',
  },
  note: {
    title: 'Yeni Not',
    description: 'Ajans operasyonu için paylaşılabilir bir not ekleyin.',
    saveLabel: 'Notu Kaydet',
  },
  invite: {
    title: 'Ekip Üyesi Davet Et',
    description: 'Yeni ekip üyesini davet ederek erişim tanımlayın.',
    saveLabel: 'Daveti Gönder',
  },
}

function ClientFields({ initialValues }: { initialValues?: ClientFormValues }) {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Şirket Adı</label>
        <Input name="company" placeholder="Örn. Bodrum Butik Otel" required defaultValue={initialValues?.company ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Yetkili Kişi</label>
          <Input name="contact" placeholder="Ad Soyad" required defaultValue={initialValues?.contact ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Telefon</label>
          <Input name="phone" placeholder="+90" required defaultValue={initialValues?.phone ?? ''} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Konum</label>
        <Input name="location" placeholder="Örn. İstanbul veya Ankara / Çankaya" defaultValue={initialValues?.location ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>E-posta</label>
          <Input name="email" type="email" placeholder="ornek@firma.com" defaultValue={initialValues?.email ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Instagram</label>
          <Input name="instagram" placeholder="https://instagram.com/..." defaultValue={initialValues?.instagram ?? ''} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>WhatsApp</label>
          <Input name="whatsapp" placeholder="+90... veya https://wa.me/..." defaultValue={initialValues?.whatsapp ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Website</label>
          <Input name="website" placeholder="ornek.com veya https://ornek.com" defaultValue={initialValues?.website ?? ''} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Hizmet Türü</label>
          <select name="service" className={selectClass} defaultValue={initialValues?.service ?? 'Web Design'} required>
            <option>Web Design</option>
            <option>SEO</option>
            <option>QR Menu</option>
            <option>E-commerce</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Durum</label>
          <select name="status" className={selectClass} defaultValue={initialValues?.status ?? 'Lead'} required>
            <option>Lead</option>
            <option>In Discussion</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Notlar</label>
          <Textarea name="notes" placeholder="Müşteri beklentileri ve detaylar..." className="min-h-20" defaultValue={initialValues?.notes ?? ''} />
        </div>
      </div>
    </>
  )
}

function ProjectFields({
  clientOptions,
  initialValues,
}: {
  clientOptions: ProjectClientOption[]
  initialValues?: ProjectFormValues
}) {
  const firstClientId = clientOptions[0]?.id ?? ''

  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Proje Adı</label>
        <Input name="name" placeholder="Örn. Kurumsal Site Yenileme" required defaultValue={initialValues?.name ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Müşteri</label>
          <select name="clientId" className={selectClass} defaultValue={initialValues?.clientId ?? firstClientId} required>
            {clientOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.company}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select name="service" className={selectClass} defaultValue={initialValues?.service ?? 'Web Design'} required>
            <option>Web Design</option>
            <option>SEO</option>
            <option>QR Menu</option>
            <option>E-commerce</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Durum</label>
          <select name="status" className={selectClass} defaultValue={initialValues?.status ?? 'Planning'} required>
            <option>Planning</option>
            <option>Design</option>
            <option>Development</option>
            <option>Revision</option>
            <option>Waiting for Client</option>
            <option>On Hold</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Öncelik</label>
          <select name="priority" className={selectClass} defaultValue={initialValues?.priority ?? 'Medium'} required>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Bütçe</label>
          <Input name="budget" type="number" min="0" placeholder="₺" required defaultValue={initialValues?.budget ?? 0} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Başlangıç</label>
          <Input name="startDate" type="date" required defaultValue={initialValues?.startDate ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Teslim</label>
          <Input name="deadline" type="date" required defaultValue={initialValues?.deadline ?? ''} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea name="description" placeholder="Proje kapsamı, teslim kriterleri, önemli notlar..." className="min-h-20" defaultValue={initialValues?.description ?? ''} />
      </div>
    </>
  )
}

function TaskFields({
  projectOptions,
  initialValues,
}: {
  projectOptions: TaskProjectOption[]
  initialValues?: TaskFormValues
}) {
  const firstProjectId = projectOptions[0]?.id ?? ''

  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Görev Başlığı</label>
        <Input name="title" placeholder="Örn. Ana sayfa hero tasarımı" required defaultValue={initialValues?.title ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlgili Proje</label>
          <select name="projectId" className={selectClass} defaultValue={initialValues?.projectId ?? firstProjectId} required>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Atanan Kişi</label>
          <Input name="assignedTo" defaultValue={initialValues?.assignedTo ?? 'Admin'} required />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Öncelik</label>
          <select name="priority" className={selectClass} defaultValue={initialValues?.priority ?? 'Medium'} required>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Durum</label>
          <select name="status" className={selectClass} defaultValue={initialValues?.status ?? 'Todo'} required>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Done</option>
            <option>Blocked</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Teslim Tarihi</label>
          <Input name="dueDate" type="date" required defaultValue={initialValues?.dueDate ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Fiyat (Opsiyonel)</label>
          <Input name="price" type="number" min="0" step="0.01" placeholder="₺" defaultValue={initialValues?.price ?? ''} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea name="notes" placeholder="Teslim beklentileri ve detay notlar..." className="min-h-20" defaultValue={initialValues?.notes ?? ''} />
      </div>
    </>
  )
}

function PaymentFields({
  clientOptions,
  projectOptions,
  initialValues,
}: {
  clientOptions: PaymentClientOption[]
  projectOptions: PaymentProjectOption[]
  initialValues?: PaymentFormValues
}) {
  const firstClientId = clientOptions[0]?.id ?? ''
  const selectedClientId = initialValues?.clientId ?? firstClientId

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Müşteri</label>
          <select name="clientId" className={selectClass} defaultValue={selectedClientId} required>
            {clientOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.company}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Tutar</label>
          <Input name="amount" type="number" min="0" placeholder="₺" required defaultValue={initialValues?.amount ?? 0} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select name="category" className={selectClass} defaultValue={initialValues?.category ?? 'Web Design'} required>
            <option>Web Design</option>
            <option>SEO</option>
            <option>QR Menu</option>
            <option>E-commerce</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Ödeme Durumu</label>
          <select name="status" className={selectClass} defaultValue={initialValues?.status ?? 'Pending'} required>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlgili Proje (Opsiyonel)</label>
          <select name="projectId" className={selectClass} defaultValue={initialValues?.projectId ?? ''}>
            <option value="">Proje yok</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Ödeme Yöntemi</label>
          <select name="method" className={selectClass} defaultValue={initialValues?.method ?? 'Banka Havalesi'} required>
            <option>Banka Havalesi</option>
            <option>EFT</option>
            <option>Kredi Kartı</option>
            <option>Nakit</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Tarih</label>
        <Input name="date" type="date" required defaultValue={initialValues?.date ?? ''} />
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea name="notes" placeholder="Fatura, vade veya ödeme notları..." className="min-h-20" defaultValue={initialValues?.notes ?? ''} />
      </div>
    </>
  )
}

function ProposalFields({
  clientOptions,
  initialValues,
}: {
  clientOptions: ProposalClientOption[]
  initialValues?: ProposalFormValues
}) {
  const firstClientId = clientOptions[0]?.id ?? ''
  const [clientMode, setClientMode] = useState<'existing' | 'new'>(initialValues?.clientMode ?? 'existing')

  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Teklif Başlığı</label>
        <Input name="title" placeholder="Örn. Web + SEO Paket Teklifi" required defaultValue={initialValues?.title ?? ''} />
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Müşteri Türü</label>
        <select
          name="clientMode"
          className={selectClass}
          value={clientMode}
          onChange={(event) => setClientMode(event.target.value as 'existing' | 'new')}
          required
        >
          <option value="existing">Mevcut Müşteri</option>
          <option value="new">Yeni Müşteri (Teklife Özel)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {clientMode === 'existing' ? (
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Müşteri</label>
            <select name="clientId" className={selectClass} defaultValue={initialValues?.clientId ?? firstClientId} required>
              {clientOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.company}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Şirket</label>
            <Input name="newClientCompany" placeholder="Yeni müşteri şirketi" required defaultValue={initialValues?.newClientCompany ?? ''} />
          </div>
        )}
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Tutar</label>
          <Input name="amount" type="number" min="0" placeholder="₺" required defaultValue={initialValues?.amount ?? 0} />
        </div>
      </div>
      {clientMode === 'new' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className={fieldLabelClass}>Yetkili Kişi</label>
              <Input name="newClientContact" placeholder="Ad Soyad" required defaultValue={initialValues?.newClientContact ?? ''} />
            </div>
            <div className="grid gap-2">
              <label className={fieldLabelClass}>Telefon</label>
              <Input name="newClientPhone" placeholder="+90" required defaultValue={initialValues?.newClientPhone ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className={fieldLabelClass}>E-posta</label>
              <Input name="newClientEmail" type="email" placeholder="ornek@firma.com" required defaultValue={initialValues?.newClientEmail ?? ''} />
            </div>
            <div className="grid gap-2">
              <label className={fieldLabelClass}>Instagram</label>
              <Input name="newClientInstagram" placeholder="https://instagram.com/..." defaultValue={initialValues?.newClientInstagram ?? ''} />
            </div>
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Gönderim Tarihi</label>
          <Input name="sentDate" type="date" defaultValue={initialValues?.sentDate ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Durum</label>
          <select name="status" className={selectClass} defaultValue={initialValues?.status ?? 'Draft'} required>
            <option>Draft</option>
            <option>Sent</option>
            <option>Under Review</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Takip Tarihi</label>
          <Input name="followUp" type="date" defaultValue={initialValues?.followUp ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Notlar</label>
          <Textarea name="notes" placeholder="Görüşme notları, revizyon beklentileri..." className="min-h-20" defaultValue={initialValues?.notes ?? ''} />
        </div>
      </div>
    </>
  )
}

function SubscriptionFields({ initialValues }: { initialValues?: SubscriptionFormValues }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Ad</label>
          <Input name="name" placeholder="Örn. Vercel Pro" required defaultValue={initialValues?.name ?? ''} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <Input name="category" placeholder="Örn. Hosting" required defaultValue={initialValues?.category ?? ''} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Faturalama</label>
          <select name="billingCycle" className={selectClass} defaultValue={initialValues?.billingCycle ?? 'Monthly'} required>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Tutar</label>
          <Input name="amount" type="number" min="0" required defaultValue={initialValues?.amount ?? 0} />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Yenileme</label>
          <Input name="renewalDate" type="date" required defaultValue={initialValues?.renewalDate ?? ''} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Aktiflik</label>
        <select name="isActive" className={selectClass} defaultValue={initialValues?.isActive === false ? 'false' : 'true'} required>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </select>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea name="notes" placeholder="Abonelik notları..." className="min-h-20" defaultValue={initialValues?.notes ?? ''} />
      </div>
    </>
  )
}

function NoteFields({
  clientOptions,
  projectOptions,
  initialValues,
}: {
  clientOptions: NoteClientOption[]
  projectOptions: NoteProjectOption[]
  initialValues?: NoteFormValues
}) {
  const tagsValue = (initialValues?.tags ?? []).join(', ')

  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Not Başlığı</label>
        <Input name="title" placeholder="Örn. Haftalık müşteri değerlendirmesi" required defaultValue={initialValues?.title ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select name="category" className={selectClass} defaultValue={initialValues?.category ?? 'Client Notes'} required>
            <option>Client Notes</option>
            <option>Meeting Notes</option>
            <option>Internal Ideas</option>
            <option>Revision Requests</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlişki Türü</label>
          <select name="relatedType" className={selectClass} defaultValue={initialValues?.relatedType ?? 'internal'} required>
            <option value="internal">Internal</option>
            <option value="client">Client</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlişkili Müşteri</label>
          <select name="clientId" className={selectClass} defaultValue={initialValues?.clientId ?? ''}>
            <option value="">Seçilmedi</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>{client.company}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlişkili Proje</label>
          <select name="projectId" className={selectClass} defaultValue={initialValues?.projectId ?? ''}>
            <option value="">Seçilmedi</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>İçerik</label>
        <Textarea name="content" placeholder="Not içeriğini buraya yazın..." className="min-h-28" required defaultValue={initialValues?.content ?? ''} />
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Etiketler</label>
        <Input name="tags" placeholder="örn. seo, revizyon, acil" defaultValue={tagsValue} />
      </div>
    </>
  )
}

function InviteFields() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Ad Soyad</label>
          <Input placeholder="Ekip üyesi adı" required />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>E-posta</label>
          <Input type="email" placeholder="uye@firma.com" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Rol</label>
          <select className={selectClass} defaultValue="Editor" required>
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Erişim Alanı</label>
          <select className={selectClass} defaultValue="Tüm Projeler" required>
            <option>Tüm Projeler</option>
            <option>Sadece Atanan Projeler</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Davet Mesajı</label>
        <Textarea placeholder="Hoş geldin mesajı veya kısa not..." className="min-h-20" />
      </div>
    </>
  )
}

export function CreateEntityDialog({
  entity,
  trigger,
  mode = 'create',
  clientInitialValues,
  onClientSubmit,
  projectInitialValues,
  onProjectSubmit,
  taskInitialValues,
  onTaskSubmit,
  proposalInitialValues,
  onProposalSubmit,
  paymentInitialValues,
  onPaymentSubmit,
  subscriptionInitialValues,
  onSubscriptionSubmit,
  noteInitialValues,
  onNoteSubmit,
}: CreateEntityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectClientOptions, setProjectClientOptions] = useState<ProjectClientOption[]>([])
  const [projectClientsError, setProjectClientsError] = useState<string | null>(null)
  const [taskProjectOptions, setTaskProjectOptions] = useState<TaskProjectOption[]>([])
  const [taskProjectsError, setTaskProjectsError] = useState<string | null>(null)
  const [proposalClientOptions, setProposalClientOptions] = useState<ProposalClientOption[]>([])
  const [proposalClientsError, setProposalClientsError] = useState<string | null>(null)
  const [paymentClientOptions, setPaymentClientOptions] = useState<PaymentClientOption[]>([])
  const [paymentProjectOptions, setPaymentProjectOptions] = useState<PaymentProjectOption[]>([])
  const [paymentOptionsError, setPaymentOptionsError] = useState<string | null>(null)
  const [noteClientOptions, setNoteClientOptions] = useState<NoteClientOption[]>([])
  const [noteProjectOptions, setNoteProjectOptions] = useState<NoteProjectOption[]>([])
  const [noteOptionsError, setNoteOptionsError] = useState<string | null>(null)

  const meta = entity === 'client' && mode === 'edit'
    ? {
        title: 'Müşteri Düzenle',
        description: 'Müşteri bilgilerini güncelleyin.',
        saveLabel: 'Değişiklikleri Kaydet',
      }
    : entity === 'project' && mode === 'edit'
      ? {
          title: 'Proje Düzenle',
          description: 'Proje bilgilerini güncelleyin.',
          saveLabel: 'Değişiklikleri Kaydet',
        }
    : entity === 'task' && mode === 'edit'
        ? {
            title: 'Görev Düzenle',
            description: 'Görev bilgilerini güncelleyin.',
            saveLabel: 'Değişiklikleri Kaydet',
          }
      : entity === 'proposal' && mode === 'edit'
          ? {
              title: 'Teklif Düzenle',
              description: 'Teklif bilgilerini güncelleyin.',
              saveLabel: 'Değişiklikleri Kaydet',
            }
      : entity === 'payment' && mode === 'edit'
          ? {
              title: 'Ödeme Düzenle',
              description: 'Ödeme bilgilerini güncelleyin.',
              saveLabel: 'Değişiklikleri Kaydet',
            }
      : entity === 'subscription' && mode === 'edit'
          ? {
              title: 'Abonelik Düzenle',
              description: 'Abonelik bilgilerini güncelleyin.',
              saveLabel: 'Değişiklikleri Kaydet',
            }
      : entity === 'note' && mode === 'edit'
          ? {
              title: 'Not Düzenle',
              description: 'Not bilgilerini güncelleyin.',
              saveLabel: 'Değişiklikleri Kaydet',
            }
      : formMeta[entity]

  useEffect(() => {
    if (entity !== 'project' || !open) {
      return
    }

    let mounted = true
    const run = async () => {
      setProjectClientsError(null)
      try {
        const response = await fetch('/api/clients')
        if (!response.ok) {
          throw new Error('Müşteri listesi yüklenemedi')
        }

        const data = (await response.json()) as Array<{ id: string; company: string }>
        if (mounted) {
          setProjectClientOptions(data.map((client) => ({ id: client.id, company: client.company })))
        }
      } catch (error) {
        if (mounted) {
          setProjectClientsError(error instanceof Error ? error.message : 'Müşteri listesi yüklenemedi')
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [entity, open])

  useEffect(() => {
    if (entity !== 'proposal' || !open) {
      return
    }

    let mounted = true
    const run = async () => {
      setProposalClientsError(null)
      try {
        const response = await fetch('/api/clients')
        if (!response.ok) {
          throw new Error('Müşteri listesi yüklenemedi')
        }

        const data = (await response.json()) as Array<{ id: string; company: string }>
        if (mounted) {
          setProposalClientOptions(data.map((client) => ({ id: client.id, company: client.company })))
        }
      } catch (error) {
        if (mounted) {
          setProposalClientsError(error instanceof Error ? error.message : 'Müşteri listesi yüklenemedi')
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [entity, open])

  useEffect(() => {
    if (entity !== 'payment' || !open) {
      return
    }

    let mounted = true
    const run = async () => {
      setPaymentOptionsError(null)
      try {
        const [clientsResponse, projectsResponse] = await Promise.all([fetch('/api/clients'), fetch('/api/projects')])
        if (!clientsResponse.ok || !projectsResponse.ok) {
          throw new Error('Ödeme formu seçenekleri yüklenemedi')
        }

        const clientsData = (await clientsResponse.json()) as Array<{ id: string; company: string }>
        const projectsData = (await projectsResponse.json()) as Array<{ id: string; name: string; clientId: string }>

        if (mounted) {
          setPaymentClientOptions(clientsData.map((client) => ({ id: client.id, company: client.company })))
          setPaymentProjectOptions(projectsData.map((project) => ({ id: project.id, name: project.name, clientId: project.clientId })))
        }
      } catch (error) {
        if (mounted) {
          setPaymentOptionsError(error instanceof Error ? error.message : 'Ödeme formu seçenekleri yüklenemedi')
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [entity, open])

  useEffect(() => {
    if (entity !== 'note' || !open) {
      return
    }

    let mounted = true
    const run = async () => {
      setNoteOptionsError(null)
      try {
        const [clientsResponse, projectsResponse] = await Promise.all([fetch('/api/clients'), fetch('/api/projects')])
        if (!clientsResponse.ok || !projectsResponse.ok) {
          throw new Error('Not formu seçenekleri yüklenemedi')
        }

        const clientsData = (await clientsResponse.json()) as Array<{ id: string; company: string }>
        const projectsData = (await projectsResponse.json()) as Array<{ id: string; name: string }>

        if (mounted) {
          setNoteClientOptions(clientsData.map((client) => ({ id: client.id, company: client.company })))
          setNoteProjectOptions(projectsData.map((project) => ({ id: project.id, name: project.name })))
        }
      } catch (error) {
        if (mounted) {
          setNoteOptionsError(error instanceof Error ? error.message : 'Not formu seçenekleri yüklenemedi')
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [entity, open])

  useEffect(() => {
    if (entity !== 'task' || !open) {
      return
    }

    let mounted = true
    const run = async () => {
      setTaskProjectsError(null)
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Proje listesi yüklenemedi')
        }

        const data = (await response.json()) as Array<{ id: string; name: string }>
        if (mounted) {
          setTaskProjectOptions(data.map((project) => ({ id: project.id, name: project.name })))
        }
      } catch (error) {
        if (mounted) {
          setTaskProjectsError(error instanceof Error ? error.message : 'Proje listesi yüklenemedi')
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [entity, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    if (entity === 'client' && onClientSubmit) {
      const formData = new FormData(form)
      const payload: ClientFormValues = {
        company: String(formData.get('company') ?? ''),
        contact: String(formData.get('contact') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        location: String(formData.get('location') ?? ''),
        email: String(formData.get('email') ?? ''),
        instagram: String(formData.get('instagram') ?? ''),
        whatsapp: String(formData.get('whatsapp') ?? ''),
        website: String(formData.get('website') ?? ''),
        service: String(formData.get('service') ?? 'Web Design') as ServiceName,
        status: String(formData.get('status') ?? 'Lead') as ClientStatus,
        notes: String(formData.get('notes') ?? ''),
      }

      setIsSubmitting(true)
      try {
        await onClientSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (entity === 'project' && onProjectSubmit) {
      const formData = new FormData(form)
      const payload: ProjectFormValues = {
        name: String(formData.get('name') ?? ''),
        clientId: String(formData.get('clientId') ?? ''),
        service: String(formData.get('service') ?? 'Web Design') as ServiceName,
        status: String(formData.get('status') ?? 'Planning') as ProjectStatus,
        priority: String(formData.get('priority') ?? 'Medium') as PriorityLevel,
        budget: Number(formData.get('budget') ?? 0),
        startDate: String(formData.get('startDate') ?? ''),
        deadline: String(formData.get('deadline') ?? ''),
        description: String(formData.get('description') ?? ''),
      }

      setIsSubmitting(true)
      try {
        await onProjectSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (entity === 'task' && onTaskSubmit) {
      const formData = new FormData(form)
      const rawPrice = String(formData.get('price') ?? '').trim()
      const payload: TaskFormValues = {
        title: String(formData.get('title') ?? ''),
        projectId: String(formData.get('projectId') ?? ''),
        assignedTo: String(formData.get('assignedTo') ?? ''),
        priority: String(formData.get('priority') ?? 'Medium') as PriorityLevel,
        status: String(formData.get('status') ?? 'Todo') as TaskStatus,
        price: rawPrice.length > 0 ? Number(rawPrice) : null,
        dueDate: String(formData.get('dueDate') ?? ''),
        notes: String(formData.get('notes') ?? ''),
      }

      setIsSubmitting(true)
      try {
        await onTaskSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (entity === 'proposal' && onProposalSubmit) {
      const formData = new FormData(form)
      const payload: ProposalFormValues = {
        title: String(formData.get('title') ?? ''),
        clientMode: String(formData.get('clientMode') ?? 'existing') as 'existing' | 'new',
        clientId: String(formData.get('clientId') ?? ''),
        newClientCompany: String(formData.get('newClientCompany') ?? ''),
        newClientContact: String(formData.get('newClientContact') ?? ''),
        newClientEmail: String(formData.get('newClientEmail') ?? ''),
        newClientPhone: String(formData.get('newClientPhone') ?? ''),
        newClientInstagram: String(formData.get('newClientInstagram') ?? ''),
        amount: Number(formData.get('amount') ?? 0),
        sentDate: String(formData.get('sentDate') ?? ''),
        status: String(formData.get('status') ?? 'Draft') as ProposalStatus,
        followUp: String(formData.get('followUp') ?? ''),
        notes: String(formData.get('notes') ?? ''),
      }

      setIsSubmitting(true)
      try {
        await onProposalSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (entity === 'payment' && onPaymentSubmit) {
      const formData = new FormData(form)
      const payload: PaymentFormValues = {
        clientId: String(formData.get('clientId') ?? ''),
        projectId: String(formData.get('projectId') ?? ''),
        amount: Number(formData.get('amount') ?? 0),
        date: String(formData.get('date') ?? ''),
        category: String(formData.get('category') ?? 'Web Design') as ServiceName,
        status: String(formData.get('status') ?? 'Pending') as PaymentStatus,
        method: String(formData.get('method') ?? ''),
        notes: String(formData.get('notes') ?? ''),
      }

      setIsSubmitting(true)
      try {
        await onPaymentSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (entity === 'subscription' && onSubscriptionSubmit) {
      const formData = new FormData(form)
      const payload: SubscriptionFormValues = {
        name: String(formData.get('name') ?? ''),
        category: String(formData.get('category') ?? ''),
        billingCycle: String(formData.get('billingCycle') ?? 'Monthly') as SubscriptionBillingCycle,
        amount: Number(formData.get('amount') ?? 0),
        renewalDate: String(formData.get('renewalDate') ?? ''),
        isActive: String(formData.get('isActive') ?? 'true') === 'true',
        notes: String(formData.get('notes') ?? ''),
      }

      setIsSubmitting(true)
      try {
        await onSubscriptionSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (entity === 'note' && onNoteSubmit) {
      const formData = new FormData(form)
      const tagsRaw = String(formData.get('tags') ?? '')
      const payload: NoteFormValues = {
        title: String(formData.get('title') ?? ''),
        category: String(formData.get('category') ?? 'Client Notes') as NoteCategory,
        relatedType: String(formData.get('relatedType') ?? 'internal') as NoteRelatedType,
        clientId: String(formData.get('clientId') ?? ''),
        projectId: String(formData.get('projectId') ?? ''),
        content: String(formData.get('content') ?? ''),
        tags: tagsRaw
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      setIsSubmitting(true)
      try {
        await onNoteSubmit(payload)
        setOpen(false)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {entity === 'project' && projectClientsError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {projectClientsError}
            </div>
          )}
          {entity === 'task' && taskProjectsError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {taskProjectsError}
            </div>
          )}
          {entity === 'proposal' && proposalClientsError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {proposalClientsError}
            </div>
          )}
          {entity === 'payment' && paymentOptionsError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {paymentOptionsError}
            </div>
          )}
          {entity === 'note' && noteOptionsError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {noteOptionsError}
            </div>
          )}
          {entity === 'client' && <ClientFields initialValues={clientInitialValues} />}
          {entity === 'project' && <ProjectFields clientOptions={projectClientOptions} initialValues={projectInitialValues} />}
          {entity === 'task' && <TaskFields projectOptions={taskProjectOptions} initialValues={taskInitialValues} />}
          {entity === 'payment' && <PaymentFields clientOptions={paymentClientOptions} projectOptions={paymentProjectOptions} initialValues={paymentInitialValues} />}
          {entity === 'proposal' && <ProposalFields clientOptions={proposalClientOptions} initialValues={proposalInitialValues} />}
          {entity === 'subscription' && <SubscriptionFields initialValues={subscriptionInitialValues} />}
          {entity === 'note' && <NoteFields clientOptions={noteClientOptions} projectOptions={noteProjectOptions} initialValues={noteInitialValues} />}
          {entity === 'invite' && <InviteFields />}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-border">İptal</Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={
                isSubmitting ||
                (entity === 'project' && projectClientOptions.length === 0) ||
                (entity === 'task' && taskProjectOptions.length === 0) ||
                (entity === 'payment' && paymentClientOptions.length === 0)
              }
            >
              {meta.saveLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
