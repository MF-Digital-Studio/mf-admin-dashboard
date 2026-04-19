import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { markNotificationRead } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(_: Request, { params }: Params) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const { id } = await params
  await markNotificationRead(id).catch(() => null)
  return NextResponse.json({ ok: true })
}

