"use client"

import * as React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
    open: boolean
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onClose: (confirmed: boolean) => void
}

export function ConfirmDialog({ open, title = 'Onay', description = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?', confirmLabel = 'Sil', cancelLabel = 'İptal', onClose }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(false) }}>
            <DialogTrigger asChild>
                <span />
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm bg-card border-border">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" className="border-border" onClick={() => onClose(false)}>{cancelLabel}</Button>
                    <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onClose(true)}>{confirmLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmDialog
