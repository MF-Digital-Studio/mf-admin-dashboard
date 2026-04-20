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
            'group toast pointer-events-auto relative overflow-hidden rounded-[18px] border px-4 py-3.5 pr-10 text-slate-900 shadow-[0_20px_44px_-22px_rgba(15,23,42,0.35)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[mounted=true]:animate-in data-[mounted=true]:fade-in-0 data-[mounted=true]:slide-in-from-right-5 data-[removed=true]:animate-out data-[removed=true]:fade-out-0 data-[removed=true]:slide-out-to-right-6 data-[swipe=true]:transition-transform flex items-start gap-3.5',
          title: 'text-[14px] font-semibold leading-tight tracking-tight text-slate-900',
          description: 'mt-1 text-[12px] leading-relaxed text-slate-700',
          closeButton:
            'absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 cursor-pointer',
          actionButton:
            'ml-auto h-7 rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-slate-800 cursor-pointer',
          cancelButton:
            'h-7 rounded-md border border-slate-300 bg-white/70 px-3 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-white cursor-pointer',
          success:
            'border-emerald-200 bg-emerald-50/95 [&_[data-icon]]:text-emerald-700 [&_[data-icon]]:bg-emerald-100 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-emerald-200 [&_[data-icon]]:rounded-xl [&_[data-icon]]:p-2 [&_[data-icon]]:w-9 [&_[data-icon]]:h-9',
          info:
            'border-blue-200 bg-blue-50/95 [&_[data-icon]]:text-blue-700 [&_[data-icon]]:bg-blue-100 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-blue-200 [&_[data-icon]]:rounded-xl [&_[data-icon]]:p-2 [&_[data-icon]]:w-9 [&_[data-icon]]:h-9',
          warning:
            'border-amber-200 bg-amber-50/95 [&_[data-icon]]:text-amber-700 [&_[data-icon]]:bg-amber-100 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-amber-200 [&_[data-icon]]:rounded-xl [&_[data-icon]]:p-2 [&_[data-icon]]:w-9 [&_[data-icon]]:h-9',
          error:
            'border-red-200 bg-red-50/95 [&_[data-icon]]:text-red-700 [&_[data-icon]]:bg-red-100 [&_[data-icon]]:ring-1 [&_[data-icon]]:ring-red-200 [&_[data-icon]]:rounded-xl [&_[data-icon]]:p-2 [&_[data-icon]]:w-9 [&_[data-icon]]:h-9',
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
