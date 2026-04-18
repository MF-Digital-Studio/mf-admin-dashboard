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
            'group toast pointer-events-auto rounded-xl border border-border bg-card shadow-lg shadow-black/10 backdrop-blur-sm px-4 py-3 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-black/15 data-[swipe=true]:transition-transform flex items-start gap-3',
          title: 'text-sm font-semibold leading-tight text-foreground',
          description: 'text-xs leading-relaxed text-muted-foreground mt-1',
          actionButton:
            'rounded-lg h-7 px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-sm ml-auto',
          cancelButton:
            'rounded-lg h-7 px-3 text-xs font-medium border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200',
          success:
            'border-l-emerald-500/50 bg-card [&_[data-icon]]:text-emerald-400 [&_[data-icon]]:bg-emerald-500/10 [&_[data-icon]]:rounded-md [&_[data-icon]]:p-1 [&_[data-icon]]:w-6 [&_[data-icon]]:h-6',
          info:
            'border-l-blue-500/50 bg-card [&_[data-icon]]:text-blue-400 [&_[data-icon]]:bg-blue-500/10 [&_[data-icon]]:rounded-md [&_[data-icon]]:p-1 [&_[data-icon]]:w-6 [&_[data-icon]]:h-6',
          warning:
            'border-l-amber-500/50 bg-card [&_[data-icon]]:text-amber-400 [&_[data-icon]]:bg-amber-500/10 [&_[data-icon]]:rounded-md [&_[data-icon]]:p-1 [&_[data-icon]]:w-6 [&_[data-icon]]:h-6',
          error:
            'border-l-red-500/50 bg-card [&_[data-icon]]:text-red-400 [&_[data-icon]]:bg-red-500/10 [&_[data-icon]]:rounded-md [&_[data-icon]]:p-1 [&_[data-icon]]:w-6 [&_[data-icon]]:h-6',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--card-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
