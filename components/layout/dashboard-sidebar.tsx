'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart3,
  FileText,
  StickyNote,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RouteId } from '@/types'

const navItems: Array<{ label: string; icon: typeof LayoutDashboard; href: string; id: RouteId }> = [
  { label: 'Gösterge Paneli', icon: LayoutDashboard, href: '/dashboard', id: 'dashboard' },
  { label: 'Müşteriler', icon: Users, href: '/clients', id: 'clients' },
  { label: 'Projeler', icon: FolderKanban, href: '/projects', id: 'projects' },
  { label: 'Finans', icon: BarChart3, href: '/finance', id: 'finance' },
  { label: 'Teklifler', icon: FileText, href: '/proposals', id: 'proposals' },
  { label: 'Notlar', icon: StickyNote, href: '/notes', id: 'notes' },
  { label: 'Ayarlar', icon: Settings, href: '/settings', id: 'settings' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard'
  }
  return pathname === href
}

interface DashboardSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    if (pathname !== previousPathnameRef.current && mobileOpen) {
      onMobileClose()
    }
    previousPathnameRef.current = pathname
  }, [mobileOpen, onMobileClose, pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileOpen])

  const sidebarContent = (isMobile = false) => (
    <>
      <div
        className={cn(
          'flex items-center gap-3 px-4 border-b border-sidebar-border',
          !isMobile ? 'h-14' : 'py-5',
          !isMobile && collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 shrink-0 overflow-hidden rounded-md">
          <Image
            src="/logo.png"
            alt="MF Digital Logo"
            width={32}
            height={32}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        {(isMobile || !collapsed) && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight leading-none">MF Digital</span>
            <span className="block text-xs text-muted-foreground leading-none mt-0.5">Yonetim Paneli</span>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-md p-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
            aria-label="Menuyu kapat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 p-2 pt-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={isMobile ? onMobileClose : undefined}
              title={!isMobile && collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150 w-full text-left group',
                !isMobile && collapsed && 'justify-center px-0',
                active
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )}
              />
              {(isMobile || !collapsed) && <span>{item.label}</span>}
              {(isMobile || !collapsed) && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      {!isMobile && (
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="flex items-center justify-center w-full rounded-md py-1.5 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      <aside
        className={cn(
          'relative hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-[60px]' : 'w-[220px]'
        )}
      >
        {sidebarContent(false)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="absolute inset-0 flex flex-col bg-sidebar">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  )
}
