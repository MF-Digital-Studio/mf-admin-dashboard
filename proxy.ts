import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isAllowedAdminUserId } from '@/lib/auth/admin-access'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/unauthorized(.*)',
  '/_clerk(.*)',
])

const isSignInRoute = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const hasAdminAccess = isAllowedAdminUserId(userId)

  if (isSignInRoute(req) && userId && hasAdminAccess) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  await auth.protect()

  if (!hasAdminAccess) {
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
