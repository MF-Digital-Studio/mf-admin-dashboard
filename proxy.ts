import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/auth/session'

const PUBLIC_PATH_PREFIXES = ['/login', '/api/auth/login', '/api/auth/logout']

const isPublicPath = (pathname: string) => PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value)

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!hasSessionCookie) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
