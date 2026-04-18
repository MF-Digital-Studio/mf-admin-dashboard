import { NextResponse } from 'next/server'
import { ensureSystemNotifications, listRecentNotifications, markAllNotificationsRead, markNotificationRead, clearBellNotifications } from '@/lib/notifications'

export async function GET() {
  await ensureSystemNotifications()
  const notifications = await listRecentNotifications(12)
  return NextResponse.json(notifications)
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: string; markAllRead?: boolean } | null

  if (body?.markAllRead) {
    await markAllNotificationsRead()
    return NextResponse.json({ ok: true })
  }

  if (body?.clearBell) {
    try {
      await clearBellNotifications()
      return NextResponse.json({ ok: true })
    } catch (err) {
      return NextResponse.json({ message: 'Failed to clear bell notifications. Run DB migration to add hiddenFromBell field.' }, { status: 500 })
    }
  }

  if (body?.id) {
    await markNotificationRead(body.id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
}
