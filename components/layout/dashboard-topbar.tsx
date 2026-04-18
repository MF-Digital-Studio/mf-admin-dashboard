'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronDown, Menu, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Trash } from 'lucide-react'
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
import { emitDashboardDataRefresh, onDashboardDataRefresh } from '@/lib/dashboard-events'

type TopbarNotification = {
  id: string
  title: string
  message: string
  eventType: 'CREATED' | 'UPDATED' | 'DELETED' | 'DUE_SOON' | 'OVERDUE'
  read: boolean
  time: string
}

const pageTitles: Record<string, string> = {
  '/': 'Gösterge Paneli',
  '/dashboard': 'Gösterge Paneli',
  '/clients': 'Müşteriler',
  '/projects': 'Projeler',
  '/tasks': 'Görevler',
  '/finance': 'Finans',
  '/proposals': 'Teklifler',
  '/notes': 'Notlar',
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
  const [notifications, setNotifications] = useState<TopbarNotification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

  const loadNotifications = useCallback(async (): Promise<TopbarNotification[]> => {
    const response = await fetch('/api/notifications')
    if (!response.ok) {
      throw new Error('Bildirimler yüklenemedi')
    }
    return (await response.json()) as TopbarNotification[]
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        const data = await loadNotifications()
        if (mounted) {
          setNotifications(data)
          setIsLoadingNotifications(false)
        }
      } catch {
        if (mounted) {
          setNotifications([])
          setIsLoadingNotifications(false)
        }
      }
    }

    const sync = () => {
      void run()
    }

    void run()
    const cleanupRefreshListener = onDashboardDataRefresh(sync)
    const intervalId = window.setInterval(() => {
      void sync()
    }, 60000)

    return () => {
      mounted = false
      cleanupRefreshListener()
      window.clearInterval(intervalId)
    }
  }, [loadNotifications])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const eventColorClass: Record<TopbarNotification['eventType'], string> = {
    CREATED: 'bg-emerald-500',
    UPDATED: 'bg-primary',
    DELETED: 'bg-red-500',
    DUE_SOON: 'bg-yellow-500',
    OVERDUE: 'bg-orange-500',
  }

  const handleNotificationsOpenChange = (open: boolean) => {
    if (!open || unreadCount === 0) {
      return
    }

    void fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markAllRead: true }),
    })

    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
    emitDashboardDataRefresh()
  }

  const handleClearBell = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearBell: true }),
      })

      if (res.ok) {
        setNotifications([])
        emitDashboardDataRefresh()
        toast.success('Bildirimler temizlendi')
      } else {
        const data = await res.json().catch(() => null)
        toast.error((data && data.message) || 'Bildirimler temizlenemedi')
      }
    } catch (err) {
      console.error('Failed to clear notifications', err)
      toast.error('Bildirimler temizlenemedi')
    }
  }


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
                trigger={
                  <DropdownMenuItem
                    className="text-sm cursor-pointer hover:bg-accent"
                    // prevent the dropdown from auto-closing so the DialogTrigger can mount reliably
                    onSelect={(e: Event) => e.preventDefault()}
                  >
                    {item.label}
                  </DropdownMenuItem>
                }
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu onOpenChange={handleNotificationsOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative hover:bg-accent">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-popover border-border p-2">
            <DropdownMenuLabel className="text-sm font-semibold text-foreground mb-1">Bildirimler</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border mb-2" />
            {isLoadingNotifications ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Yükleniyor...</p>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 6).map((notification) => (
                <div key={notification.id} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-accent cursor-pointer">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${eventColorClass[notification.eventType]}`} />
                  <div>
                    <p className="text-sm text-foreground leading-snug">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-2 py-3 text-sm text-muted-foreground">Henüz bildirim yok</p>
            )}
            <div className="mt-2">
              <DropdownMenuSeparator className="bg-border mt-2" />
              <div className="px-2 pt-2">
                <button
                  onClick={handleClearBell}
                  className="flex items-center gap-2 w-full rounded-md px-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  <span>Tümünü Temizle</span>
                </button>
              </div>
            </div>
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
            <DropdownMenuItem className="text-sm cursor-pointer hover:bg-accent">
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
