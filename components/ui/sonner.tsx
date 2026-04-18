'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md gap-3 data-[swipe=true]:transition-transform',
          title: 'text-sm font-semibold tracking-tight',
          description: 'text-sm opacity-90 leading-snug',
          actionButton:
            'rounded-md h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton:
            'rounded-md h-8 px-3 text-xs font-semibold border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80',
          success:
            'border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-card to-card text-foreground [&_[data-icon]]:text-emerald-400',
          info:
            'border-sky-500/40 bg-gradient-to-br from-sky-500/15 via-card to-card text-foreground [&_[data-icon]]:text-sky-400',
          warning:
            'border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-card to-card text-foreground [&_[data-icon]]:text-amber-400',
          error:
            'border-red-500/40 bg-gradient-to-br from-red-500/15 via-card to-card text-foreground [&_[data-icon]]:text-red-400',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
