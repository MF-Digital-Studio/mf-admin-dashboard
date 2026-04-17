'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, Menu, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { CreateEntityDialog, type CreateEntityType } from '@/components/shared/create-entity-dialog'

const pageTitles: Record<string, string> = {
  '/': 'Gösterge Paneli',
  '/dashboard': 'Gösterge Paneli',
  '/clients': 'Müşteriler',
  '/projects': 'Projeler',
  '/tasks': 'Görevler',
  '/finance': 'Finans',
  '/proposals': 'Teklifler',
  '/notes': 'Notlar',
  '/files': 'Dosyalar',
  '/settings': 'Ayarlar',
}

const quickAddItems: Array<{ label: string; entity: CreateEntityType }> = [
  { label: 'Yeni Müşteri', entity: 'client' },
  { label: 'Yeni Proje', entity: 'project' },
  { label: 'Yeni Görev', entity: 'task' },
  { label: 'Yeni Ödeme', entity: 'payment' },
  { label: 'Yeni Teklif', entity: 'proposal' },
]

interface DashboardTopbarProps {
  onMobileMenuOpen: () => void
}

export function DashboardTopbar({ onMobileMenuOpen }: DashboardTopbarProps) {
  const pathname = usePathname()

  return (
    <header className="flex items-center justify-between h-14 px-3 sm:px-4 border-b border-border bg-card shrink-0 gap-2 sm:gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMobileMenuOpen}
        className="h-8 w-8 p-0 md:hidden hover:bg-accent"
        aria-label="Menüyü aç"
      >
        <Menu className="w-4 h-4 text-muted-foreground" />
      </Button>

      <h1 className="text-base font-semibold text-foreground hidden md:block">
        {pageTitles[pathname] ?? 'Gösterge Paneli'}
      </h1>

      <div className="relative hidden sm:block flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Müşteri, proje ara..."
          className="pl-8 h-8 text-sm bg-secondary border-border placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 px-2 sm:px-3 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hızlı Ekle</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
            <DropdownMenuLabel className="text-sm text-muted-foreground">Oluştur</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {quickAddItems.map((item) => (
              <CreateEntityDialog
                key={item.label}
                entity={item.entity}
                trigger={<DropdownMenuItem className="text-sm cursor-pointer hover:bg-accent">{item.label}</DropdownMenuItem>}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative hover:bg-accent">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-popover border-border p-2">
            <DropdownMenuLabel className="text-sm font-semibold text-foreground mb-1">Bildirimler</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border mb-2" />
            {[
              { msg: 'Bodrum Butik ödemesi ₺19.000 alındı', time: '2 sa önce', dot: 'bg-emerald-500' },
              { msg: 'Teklif kabul edildi - Sosyal Medya Eklentisi', time: '1 g önce', dot: 'bg-primary' },
              { msg: 'Görev gecikti: Google Analytics Kurulumu', time: '2 g önce', dot: 'bg-red-500' },
            ].map((notification, index) => (
              <div key={index} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-accent cursor-pointer">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${notification.dot}`} />
                <div>
                  <p className="text-sm text-foreground leading-snug">{notification.msg}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
                </div>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">MF</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground leading-none">Admin</p>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">Kurucu</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-popover border-border">
            <DropdownMenuItem asChild className="text-sm cursor-pointer hover:bg-accent">
              <Link href="/settings">Ayarlar</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-sm text-destructive-foreground cursor-pointer hover:bg-accent">
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
