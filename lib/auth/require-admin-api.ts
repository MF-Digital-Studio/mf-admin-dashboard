import { getCurrentAdminSession } from '@/lib/auth/session'

type AdminApiAccessResult =
  | {
      ok: true
      session: NonNullable<Awaited<ReturnType<typeof getCurrentAdminSession>>>
    }
  | {
      ok: false
      response: Response
    }

export async function requireAdminApiAccess(): Promise<AdminApiAccessResult> {
  const session = await getCurrentAdminSession()

  if (!session) {
    return {
      ok: false,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, session }
}
