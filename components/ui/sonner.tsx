'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/components/theme-provider'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast pointer-events-auto relative overflow-hidden rounded-[22px] border border-slate-200/90 bg-white px-4 py-4 pr-12 text-slate-900 shadow-[0_18px_42px_-22px_rgba(15,23,42,0.3)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[mounted=true]:animate-in data-[mounted=true]:fade-in-0 data-[mounted=true]:slide-in-from-right-4 data-[removed=true]:animate-out data-[removed=true]:fade-out-0 data-[removed=true]:slide-out-to-right-5 data-[swipe=true]:transition-transform flex items-center gap-4 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100',
          title: 'text-[15px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100',
          description: 'mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300',
          closeButton:
            'absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 cursor-pointer dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200',
          actionButton:
            'ml-auto h-7 rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-slate-800 cursor-pointer',
          cancelButton:
            'h-7 rounded-md border border-slate-300 bg-white/70 px-3 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-white cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
          success:
            '[&_[data-icon]]:text-emerald-600 [&_[data-icon]]:bg-emerald-100/90 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-emerald-200/90 [&_[data-title]]:text-emerald-700 dark:[&_[data-icon]]:text-emerald-300 dark:[&_[data-icon]]:bg-emerald-900/40 dark:[&_[data-icon]]:ring-emerald-700/60 dark:[&_[data-title]]:text-emerald-300',
          info:
            '[&_[data-icon]]:text-blue-600 [&_[data-icon]]:bg-blue-100/90 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-blue-200/90 [&_[data-title]]:text-blue-700 dark:[&_[data-icon]]:text-blue-300 dark:[&_[data-icon]]:bg-blue-900/40 dark:[&_[data-icon]]:ring-blue-700/60 dark:[&_[data-title]]:text-blue-300',
          warning:
            '[&_[data-icon]]:text-amber-600 [&_[data-icon]]:bg-amber-100/90 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-amber-200/90 [&_[data-title]]:text-amber-700 dark:[&_[data-icon]]:text-amber-300 dark:[&_[data-icon]]:bg-amber-900/40 dark:[&_[data-icon]]:ring-amber-700/60 dark:[&_[data-title]]:text-amber-300',
          error:
            '[&_[data-icon]]:text-red-600 [&_[data-icon]]:bg-red-100/90 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-red-200/90 [&_[data-title]]:text-red-700 dark:[&_[data-icon]]:text-red-300 dark:[&_[data-icon]]:bg-red-900/40 dark:[&_[data-icon]]:ring-red-700/60 dark:[&_[data-title]]:text-red-300',
          icon: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-2.5 [&_svg]:h-5 [&_svg]:w-5',
          content: 'min-w-0 flex-1',
        },
      }}
      style={
        {
          '--normal-bg': 'oklch(0.985 0.008 95)',
          '--normal-text': 'oklch(0.27 0.01 260)',
          '--normal-border': 'oklch(0.89 0.01 260)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
