import { auth } from '@clerk/nextjs/server'
import { isAllowedAdminUserId } from '@/lib/auth/admin-access'

type AdminApiAccessResult =
  | {
      ok: true
      userId: string
    }
  | {
      ok: false
      response: Response
    }

export async function requireAdminApiAccess(): Promise<AdminApiAccessResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      ok: false,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  if (!isAllowedAdminUserId(userId)) {
    return {
      ok: false,
      response: Response.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true, userId }
}
