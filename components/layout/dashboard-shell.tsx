'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardTopbar } from './dashboard-topbar'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  if (pathname.startsWith('/login')) {
    return <>{children}</>
  }

  return (
    <div className="flex h-dvh min-h-0 bg-background text-foreground">
      <DashboardSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
