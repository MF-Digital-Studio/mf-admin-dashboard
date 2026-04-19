import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE_NAME, getCurrentSessionToken, revokeAdminSessionByToken } from '@/lib/auth/session'

export async function POST(request: Request) {
  const token = await getCurrentSessionToken()
  if (token) {
    await revokeAdminSessionByToken(token)
  }

  const contentType = request.headers.get('content-type') ?? ''
  const fromForm = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')

  if (fromForm) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
