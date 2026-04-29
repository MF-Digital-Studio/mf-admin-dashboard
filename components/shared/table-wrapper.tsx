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
      <div className="flex flex-wrap items-start justify-between px-5 py-4 border-b border-border gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}
