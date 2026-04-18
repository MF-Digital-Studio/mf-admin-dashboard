import { NextResponse } from 'next/server'
import { markNotificationRead } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(_: Request, { params }: Params) {
  const { id } = await params
  await markNotificationRead(id).catch(() => null)
  return NextResponse.json({ ok: true })
}
