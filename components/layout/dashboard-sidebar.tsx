'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  BarChart3,
  FileText,
  Layers,
  StickyNote,
  Files,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RouteId } from '@/types'

const navItems: Array<{ label: string; icon: typeof LayoutDashboard; href: string; id: RouteId }> = [
  { label: 'Gösterge Paneli', icon: LayoutDashboard, href: '/dashboard', id: 'dashboard' },
  { label: 'Müşteriler', icon: Users, href: '/clients', id: 'clients' },
  { label: 'Projeler', icon: FolderKanban, href: '/projects', id: 'projects' },
  { label: 'Görevler', icon: CheckSquare, href: '/tasks', id: 'tasks' },
  { label: 'Finans', icon: BarChart3, href: '/finance', id: 'finance' },
  { label: 'Teklifler', icon: FileText, href: '/proposals', id: 'proposals' },
  { label: 'Hizmetler', icon: Layers, href: '/services', id: 'services' },
  { label: 'Notlar', icon: StickyNote, href: '/notes', id: 'notes' },
  { label: 'Dosyalar', icon: Files, href: '/files', id: 'files' },
  { label: 'Ayarlar', icon: Settings, href: '/settings', id: 'settings' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard'
  }
  return pathname === href
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-sidebar-border', collapsed && 'justify-center px-0')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight leading-none">MF Digital</span>
            <span className="block text-xs text-muted-foreground leading-none mt-0.5">Yönetim Paneli</span>
          </div>
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
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150 w-full text-left group',
                collapsed && 'justify-center px-0',
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
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed((value) => !value)}
          className="flex items-center justify-center w-full rounded-md py-1.5 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
