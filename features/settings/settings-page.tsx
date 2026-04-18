'use client'

import { useEffect, useState } from 'react'
import { Check, Palette, User, Users } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'

const tabs = [
  { id: 'general', label: 'Genel', icon: User },
  { id: 'team', label: 'Ekip', icon: Users },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
]

const themeOptions = [
  { label: 'Koyu', value: 'dark' },
  { label: 'Açık', value: 'light' },
  { label: 'Sistem', value: 'system' },
] as const

type SettingsData = {
  agencyName: string
  email: string
  phone: string
  website: string
  defaultCurrency: string
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message ?? 'Request failed')
  }
  return (await response.json()) as T
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<SettingsData>({
    agencyName: 'MF Digital Studio',
    email: 'info@mfdigital.com',
    phone: '+90 555 000 0000',
    website: 'https://mfdigital.com',
    defaultCurrency: 'TRY',
  })
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await fetchJson<SettingsData>('/api/settings')
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await fetchJson('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      toast.success('Ayarlar kaydedildi')
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi')
    }
  }

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      <div className="w-full md:w-[200px] shrink-0 border-b md:border-b-0 md:border-r border-border p-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">Ayarlar</p>
        <div className="flex md:block gap-1 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap md:w-full',
                  activeTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', activeTab === tab.id ? 'text-primary' : 'text-muted-foreground')} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === 'general' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Genel Ayarlar" description="Ajans profilini ve tercihlerini yönet" />

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Ajans Profili</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Ajans Adı</label>
                  <Input
                    value={settings.agencyName}
                    onChange={(e) => handleInputChange('agencyName', e.target.value)}
                    className="h-8 text-sm bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">E-posta</label>
                  <Input
                    value={settings.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-8 text-sm bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Telefon</label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-8 text-sm bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Web Sitesi</label>
                  <Input
                    value={settings.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="h-8 text-sm bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Varsayılan Para Birimi</label>
                  <Input
                    value={settings.defaultCurrency}
                    onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                    className="h-8 text-sm bg-secondary border-border"
                  />
                </div>
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
              </div>
              <div className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">MF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Admin</p>
                  <p className="text-sm text-muted-foreground">admin@mfdigitalstudio.com</p>
                </div>
                <span className="text-sm text-muted-foreground">Kurucu / Lider</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">Aktif</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="max-w-xl space-y-6">
            <PageHeader title="Görünüm" description="Panelin görünümünü özelleştir" />

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Tema</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
