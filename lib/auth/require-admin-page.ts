import { redirect } from 'next/navigation'
import { getCurrentAdminSession } from '@/lib/auth/session'

export async function requireAdminPageAccess() {
  const session = await getCurrentAdminSession()
  if (!session) {
    redirect('/login')
  }

  return session
}
