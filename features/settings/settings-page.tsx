'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, CreditCard, Palette, Shield, User, Users } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { CreateEntityDialog } from '@/components/shared/create-entity-dialog'

const tabs = [
  { id: 'general', label: 'Genel', icon: User },
  { id: 'team', label: 'Ekip', icon: Users },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'billing', label: 'Faturalama', icon: CreditCard },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'security', label: 'Güvenlik', icon: Shield },
]

const teamMembers = [
  { name: 'Mustafa F.', role: 'Kurucu / Lider', email: 'mustafa@mfdigital.com', avatar: 'MF', status: 'Active' },
]

const themeOptions = [
  { label: 'Koyu', value: 'dark' },
  { label: 'Açık', value: 'light' },
  { label: 'Sistem', value: 'system' },
] as const

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[200px] shrink-0 border-r border-border p-3 space-y-0.5">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">Ayarlar</p>
        {tabs.map((tab) => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', activeTab === tab.id ? 'text-primary' : 'text-muted-foreground')} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'general' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Genel Ayarlar" description="Ajans profilini ve tercihlerini yönet" />

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Ajans Profili</h4>
              <div className="space-y-3">
                {[
                  { label: 'Ajans Adı', value: 'MF Digital Studio' },
                  { label: 'E-posta', value: 'info@mfdigital.com' },
                  { label: 'Telefon', value: '+90 555 000 0000' },
                  { label: 'Web Sitesi', value: 'https://mfdigital.com' },
                  { label: 'Varsayılan Para Birimi', value: '₺ TRY' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">{field.label}</label>
                    <Input defaultValue={field.value} className="h-8 text-sm bg-secondary border-border" />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Kaydedildi!
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </Button>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Ekip" description="Ekip üyelerini ve yetkileri yönet" />

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Üyeler (1)</h4>
                <CreateEntityDialog entity="invite" trigger={<Button size="sm" className="h-7 text-sm bg-primary text-primary-foreground">+ Davet Et</Button>} />
              </div>
              {teamMembers.map((member) => (
                <div key={member.email} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{member.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{member.role}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">Aktif</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Bildirimler" description="Uyarıları ne zaman ve nasıl alacağını ayarla" />

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              {[
                { label: 'Ödeme alındı', desc: 'Müşteri ödemesi işlendiğinde bildir', defaultOn: true },
                { label: 'Teklif kabul edildi', desc: 'Müşteri teklifi kabul ettiğinde bildir', defaultOn: true },
                { label: 'Görev gecikti', desc: 'Geciken görevler için günlük özet', defaultOn: true },
                { label: 'Proje teslim tarihi', desc: 'Teslim tarihinden 3 gün önce bildir', defaultOn: false },
                { label: 'Yeni müşteri eklendi', desc: 'Yeni müşteri oluşturulduğunda bildir', defaultOn: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <button className={cn('w-10 h-5 rounded-full relative transition-colors', item.defaultOn ? 'bg-primary' : 'bg-secondary border border-border')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm', item.defaultOn ? 'left-5' : 'left-0.5')} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Faturalama" description="Abonelik ve ödeme yöntemini yönet" />

            <div className="bg-card border border-primary/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">Yıllık faturalandırma</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary text-sm font-semibold border border-primary/30">Aktif</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₺299<span className="text-sm font-normal text-muted-foreground">/ay</span></p>
              <p className="text-sm text-muted-foreground mt-1">Sonraki fatura: 1 Haziran 2024</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Ödeme Yöntemi</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                <div className="w-10 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Son Kullanma: 12/26</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto h-7 text-sm text-muted-foreground hover:text-foreground">Değiştir</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Görünüm" description="Panelin görünümünü özelleştir" />

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Tema</h4>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'p-3 rounded-lg border text-sm font-medium transition-colors',
                      (mounted ? theme === option.value : option.value === 'dark')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Vurgu Rengi</h4>
                <div className="flex gap-2.5">
                  {[
                    { name: 'Mavi', cls: 'bg-blue-500' },
                    { name: 'Camgöbeği', cls: 'bg-cyan-500' },
                    { name: 'Zümrüt', cls: 'bg-emerald-500' },
                    { name: 'Mor', cls: 'bg-purple-500' },
                    { name: 'Turuncu', cls: 'bg-orange-500' },
                  ].map((color) => (
                    <button
                      key={color.name}
                      title={color.name}
                      className={cn('w-7 h-7 rounded-full transition-all hover:scale-110', color.cls, color.name === 'Mavi' && 'ring-2 ring-offset-2 ring-offset-background ring-blue-500')}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Güvenlik" description="Hesap güvenlik ayarlarını yönet" />

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Şifre Değiştir</h4>
              <div className="space-y-3">
                {['Mevcut Şifre', 'Yeni Şifre', 'Şifreyi Onayla'].map((label) => (
                  <div key={label}>
                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">{label}</label>
                    <Input type="password" placeholder="••••••••" className="h-8 text-sm bg-secondary border-border" />
                  </div>
                ))}
                <Button size="sm" className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">Şifreyi Güncelle</Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">İki Aşamalı Doğrulama</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Hesabına ek bir güvenlik katmanı ekle</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-sm border-border hover:bg-secondary">2FA Etkinleştir</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
