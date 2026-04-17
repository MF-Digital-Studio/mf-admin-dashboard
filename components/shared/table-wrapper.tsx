import type { ReactNode } from 'react'

interface TableWrapperProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function TableWrapper({ title, description, action, children }: TableWrapperProps) {
  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
