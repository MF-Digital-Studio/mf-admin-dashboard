'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { clients } from '@/features/clients/data'
import { projects } from '@/features/projects/data'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export type CreateEntityType = 'client' | 'project' | 'task' | 'payment' | 'proposal' | 'note' | 'file' | 'invite'

interface CreateEntityDialogProps {
  entity: CreateEntityType
  trigger: ReactNode
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
  file: {
    title: 'Dosya Yükle',
    description: 'Dosya kaydını ekleyerek arşivi güncel tutun.',
    saveLabel: 'Dosyayı Kaydet',
  },
  invite: {
    title: 'Ekip Üyesi Davet Et',
    description: 'Yeni ekip üyesini davet ederek erişim tanımlayın.',
    saveLabel: 'Daveti Gönder',
  },
}

function ClientFields() {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Şirket Adı</label>
        <Input placeholder="Örn. Bodrum Butik Otel" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Yetkili Kişi</label>
          <Input placeholder="Ad Soyad" required />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Telefon</label>
          <Input placeholder="+90" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>E-posta</label>
          <Input type="email" placeholder="ornek@firma.com" required />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Hizmet Türü</label>
          <select className={selectClass} defaultValue="Web Design" required>
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
          <select className={selectClass} defaultValue="Lead" required>
            <option>Lead</option>
            <option>In Discussion</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Notlar</label>
          <Textarea placeholder="Müşteri beklentileri ve detaylar..." className="min-h-20" />
        </div>
      </div>
    </>
  )
}

function ProjectFields({ clientNames }: { clientNames: string[] }) {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Proje Adı</label>
        <Input placeholder="Örn. Kurumsal Site Yenileme" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Müşteri</label>
          <select className={selectClass} defaultValue={clientNames[0] ?? ''} required>
            {clientNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select className={selectClass} defaultValue="Web Design" required>
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
          <select className={selectClass} defaultValue="Planning" required>
            <option>Planning</option>
            <option>Design</option>
            <option>Development</option>
            <option>Revision</option>
            <option>Waiting for Client</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Öncelik</label>
          <select className={selectClass} defaultValue="Medium" required>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Bütçe</label>
          <Input type="number" min="0" placeholder="₺" required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Başlangıç</label>
          <Input type="date" required />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Teslim</label>
          <Input type="date" required />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlerleme (%)</label>
          <Input type="number" min="0" max="100" defaultValue="0" required />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea placeholder="Proje kapsamı, teslim kriterleri, önemli notlar..." className="min-h-20" />
      </div>
    </>
  )
}

function TaskFields({ projectNames }: { projectNames: string[] }) {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Görev Başlığı</label>
        <Input placeholder="Örn. Ana sayfa hero tasarımı" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlgili Proje</label>
          <select className={selectClass} defaultValue={projectNames[0] ?? ''} required>
            {projectNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Atanan Kişi</label>
          <Input defaultValue="Admin" required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Öncelik</label>
          <select className={selectClass} defaultValue="Medium" required>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Durum</label>
          <select className={selectClass} defaultValue="Todo" required>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Done</option>
            <option>Blocked</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Teslim Tarihi</label>
          <Input type="date" required />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea placeholder="Teslim beklentileri ve detay notlar..." className="min-h-20" />
      </div>
    </>
  )
}

function PaymentFields({ clientNames }: { clientNames: string[] }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Müşteri</label>
          <select className={selectClass} defaultValue={clientNames[0] ?? ''} required>
            {clientNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Tutar</label>
          <Input type="number" min="0" placeholder="₺" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select className={selectClass} defaultValue="Web Tasarım" required>
            <option>Web Tasarım</option>
            <option>SEO</option>
            <option>QR Menü</option>
            <option>E-ticaret</option>
            <option>Bakım</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Ödeme Durumu</label>
          <select className={selectClass} defaultValue="Pending" required>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Ödeme Yöntemi</label>
          <select className={selectClass} defaultValue="Banka Havalesi" required>
            <option>Banka Havalesi</option>
            <option>EFT</option>
            <option>Kredi Kartı</option>
            <option>Nakit</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Tarih</label>
          <Input type="date" required />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Notlar</label>
        <Textarea placeholder="Fatura, vade veya ödeme notları..." className="min-h-20" />
      </div>
    </>
  )
}

function ProposalFields({ clientNames }: { clientNames: string[] }) {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Teklif Başlığı</label>
        <Input placeholder="Örn. Web + SEO Paket Teklifi" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Müşteri</label>
          <select className={selectClass} defaultValue={clientNames[0] ?? ''} required>
            {clientNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Tutar</label>
          <Input type="number" min="0" placeholder="₺" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Gönderim Tarihi</label>
          <Input type="date" />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Durum</label>
          <select className={selectClass} defaultValue="Draft" required>
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
          <Input type="date" />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Notlar</label>
          <Textarea placeholder="Görüşme notları, revizyon beklentileri..." className="min-h-20" />
        </div>
      </div>
    </>
  )
}

function NoteFields() {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Not Başlığı</label>
        <Input placeholder="Örn. Haftalık müşteri değerlendirmesi" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select className={selectClass} defaultValue="Client Notes" required>
            <option>Client Notes</option>
            <option>Meeting Notes</option>
            <option>Internal Ideas</option>
            <option>Revision Requests</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>İlişkili Kayıt</label>
          <Input placeholder="Müşteri veya proje adı" />
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>İçerik</label>
        <Textarea placeholder="Not içeriğini buraya yazın..." className="min-h-28" required />
      </div>
    </>
  )
}

function FileFields({ clientNames, projectNames }: { clientNames: string[]; projectNames: string[] }) {
  return (
    <>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Dosya Adı</label>
        <Input placeholder="Örn. ana-sayfa-tasarim-v2.fig" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Kategori</label>
          <select className={selectClass} defaultValue="Assets" required>
            <option>Logos</option>
            <option>Contracts</option>
            <option>Assets</option>
            <option>Deliverables</option>
            <option>Screenshots</option>
            <option>Documents</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Dosya Türü</label>
          <select className={selectClass} defaultValue="pdf" required>
            <option>pdf</option>
            <option>jpg</option>
            <option>png</option>
            <option>ai</option>
            <option>fig</option>
            <option>zip</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Müşteri</label>
          <select className={selectClass} defaultValue={clientNames[0] ?? ''}>
            {clientNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>Proje</label>
          <select className={selectClass} defaultValue={projectNames[0] ?? ''}>
            {projectNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className={fieldLabelClass}>Açıklama</label>
        <Textarea placeholder="Dosya hakkında kısa not..." className="min-h-20" />
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

export function CreateEntityDialog({ entity, trigger }: CreateEntityDialogProps) {
  const [open, setOpen] = useState(false)
  const meta = formMeta[entity]

  const clientNames = useMemo(() => clients.map((client) => client.company), [])
  const projectNames = useMemo(() => projects.map((project) => project.name), [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
          {entity === 'client' && <ClientFields />}
          {entity === 'project' && <ProjectFields clientNames={clientNames} />}
          {entity === 'task' && <TaskFields projectNames={projectNames} />}
          {entity === 'payment' && <PaymentFields clientNames={clientNames} />}
          {entity === 'proposal' && <ProposalFields clientNames={clientNames} />}
          {entity === 'note' && <NoteFields />}
          {entity === 'file' && <FileFields clientNames={clientNames} projectNames={projectNames} />}
          {entity === 'invite' && <InviteFields />}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-border">İptal</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {meta.saveLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
