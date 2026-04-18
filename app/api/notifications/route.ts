import { NextResponse } from 'next/server'
import { ensureSystemNotifications, listRecentNotifications, markAllNotificationsRead, markNotificationRead, clearBellNotifications } from '@/lib/notifications'

export async function GET() {
  try {
    try {
      await ensureSystemNotifications()
    } catch {
      // Ignore optional notification generation failures in production.
    }

    const notifications = await listRecentNotifications(12).catch(() => [])
    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { id?: string; markAllRead?: boolean; clearBell?: boolean } | null

    if (body?.markAllRead) {
      await markAllNotificationsRead().catch(() => undefined)
      return NextResponse.json({ ok: true })
    }

    if (body?.clearBell) {
      await clearBellNotifications().catch(() => undefined)
      return NextResponse.json({ ok: true })
    }

    if (body?.id) {
      await markNotificationRead(body.id).catch(() => undefined)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
