'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SearchableSelectOption = {
  value: string
  label: string
}

interface SearchableSelectProps {
  name: string
  options: SearchableSelectOption[]
  defaultValue?: string
  placeholder?: string
  emptyLabel?: string
  required?: boolean
  className?: string
  onChange?: (value: string) => void
}

export function SearchableSelect({
  name,
  options,
  defaultValue = '',
  placeholder = 'Seçin...',
  emptyLabel = 'Seçilmedi',
  required = false,
  className,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const selectedOption = options.find((o) => o.value === selected)

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')))
    : options

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search on open
  useEffect(() => {
    if (open) {
      setActiveIndex(-1)
      setTimeout(() => searchRef.current?.focus(), 10)
    }
  }, [open])

  // Keyboard navigation
  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setSearch('')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && filtered[activeIndex]) {
        selectOption(filtered[activeIndex].value)
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  function selectOption(value: string) {
    setSelected(value)
    setOpen(false)
    setSearch('')
    onChange?.(value)
  }

  function clearSelection(event: React.MouseEvent) {
    event.stopPropagation()
    setSelected('')
    onChange?.('')
  }

  return (
    <div ref={containerRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selected} required={required} />

      {/* Trigger button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors',
          'hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          'text-left',
          open && 'ring-2 ring-ring ring-offset-1',
        )}
      >
        <span className={cn('flex-1 truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="ml-2 flex shrink-0 items-center gap-1">
          {selected && !required && (
            <span
              role="button"
              tabIndex={-1}
              onClick={clearSelection}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="dialog"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setActiveIndex(-1)
              }}
              placeholder="Ara..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {!required && (
              <li
                role="option"
                aria-selected={selected === ''}
                onClick={() => selectOption('')}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent',
                  selected === '' && 'bg-accent/50',
                )}
              >
                <Check className={cn('h-3.5 w-3.5 shrink-0', selected === '' ? 'opacity-100' : 'opacity-0')} />
                {emptyLabel}
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">Sonuç bulunamadı</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === selected}
                  onClick={() => selectOption(option.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent',
                    option.value === selected && 'bg-accent/50 font-medium',
                    activeIndex === index && 'bg-accent',
                  )}
                >
                  <Check
                    className={cn('h-3.5 w-3.5 shrink-0 text-primary', option.value === selected ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{option.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
