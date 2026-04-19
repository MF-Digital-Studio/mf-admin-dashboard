import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'

export async function GET() {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }

  return NextResponse.json({
    user: {
      id: adminCheck.session.user.id,
      name: adminCheck.session.user.name,
      email: adminCheck.session.user.email,
    },
  })
}
