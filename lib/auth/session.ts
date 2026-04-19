import { randomBytes, createHash } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const ADMIN_SESSION_COOKIE_NAME = 'mf_admin_session'

const DEFAULT_SESSION_TTL_HOURS = 24 * 7

const getSessionTtlHours = () => {
  const raw = Number(process.env.ADMIN_SESSION_TTL_HOURS)
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_SESSION_TTL_HOURS
  }
  return Math.min(raw, 24 * 30)
}

const sessionExpiryDate = () => new Date(Date.now() + getSessionTtlHours() * 60 * 60 * 1000)

const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex')

const isProduction = process.env.NODE_ENV === 'production'

export const getSessionCookieOptions = (expiresAt: Date) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  expires: expiresAt,
})

type SessionUser = {
  id: string
  name: string
  email: string
}

export type AdminSessionContext = {
  id: string
  expiresAt: Date
  user: SessionUser
}

export async function createAdminSession(adminUserId: string) {
  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashSessionToken(token)
  const expiresAt = sessionExpiryDate()

  const session = await prisma.adminSession.create({
    data: {
      tokenHash,
      adminUserId,
      expiresAt,
    },
  })

  return { token, expiresAt, sessionId: session.id }
}

export async function revokeAdminSessionByToken(token: string) {
  const tokenHash = hashSessionToken(token)

  await prisma.adminSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}

async function getValidSessionByToken(token: string): Promise<AdminSessionContext | null> {
  const tokenHash = hashSessionToken(token)
  const now = new Date()

  const session = await prisma.adminSession.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
      adminUser: {
        isActive: true,
      },
    },
    select: {
      id: true,
      expiresAt: true,
      adminUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  void prisma.adminSession.update({
    where: { id: session.id },
    data: { lastSeenAt: now },
  })

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: session.adminUser,
  }
}

export async function getCurrentAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  return getValidSessionByToken(token)
}

export async function getCurrentSessionToken() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null
}
