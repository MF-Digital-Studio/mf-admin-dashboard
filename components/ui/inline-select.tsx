"use client"

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { BadgePill } from '@/components/shared/badges'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

interface InlineSelectProps {
    value: string
    options: Option[]
    onChange: (value: string) => Promise<void> | void
    className?: string
}

export function InlineSelect({ value, options, onChange, className }: InlineSelectProps) {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSelect = async (val: string) => {
        if (val === value) return
        try {
            setIsLoading(true)
            await onChange(val)
        } finally {
            setIsLoading(false)
        }
    }

    const current = options.find((o) => o.value === value) ?? { value, label: value }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn('p-0 bg-transparent border-0 cursor-pointer', className)}>
                    <BadgePill tone={('zinc' as any)} className="cursor-pointer">
                        <span className="flex items-center gap-1">
                            {current.label}
                            <ChevronDown className="w-3 h-3 opacity-60" />
                        </span>
                    </BadgePill>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={6} className="!p-1">
                {options.map((opt) => (
                    <DropdownMenuItem key={opt.value} className="text-sm px-3 py-1.5" onSelect={() => void handleSelect(opt.value)}>
                        {opt.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default InlineSelect
