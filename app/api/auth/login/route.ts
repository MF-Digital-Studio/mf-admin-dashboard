import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { ADMIN_SESSION_COOKIE_NAME, createAdminSession, getSessionCookieOptions } from '@/lib/auth/session'

const INVALID_CREDENTIALS_MESSAGE = 'Email veya sifre hatali'
const SERVER_ERROR_MESSAGE = 'Giris sirasinda sunucu hatasi olustu'

const normalizeEmail = (value: string) => value.trim().toLowerCase()

function parseCredentials(request: Request): Promise<{
  email: string
  password: string
  fromForm: boolean
}> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return request.json().then((body) => ({
      email: typeof body?.email === 'string' ? body.email : '',
      password: typeof body?.password === 'string' ? body.password : '',
      fromForm: false,
    }))
  }

  return request.formData().then((formData) => ({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    fromForm: true,
  }))
}

function isMissingDatabaseConfigError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  return message.includes('Environment variable not found: DATABASE_URL')
}

function buildServerErrorResponse(request: Request, fromForm: boolean, error: unknown) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    console.error('[auth/login] unexpected error:', error)
  } else {
    console.error('[auth/login] unexpected error')
  }

  if (fromForm) {
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021' || error.code === 'P2022') {
      return NextResponse.json(
        {
          message: SERVER_ERROR_MESSAGE,
          code: 'AUTH_STORAGE_NOT_READY',
          ...(isDevelopment ? { detail: error.message } : {}),
        },
        { status: 500 },
      )
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError || isMissingDatabaseConfigError(error)) {
    return NextResponse.json(
      {
        message: SERVER_ERROR_MESSAGE,
        code: 'AUTH_DB_UNAVAILABLE',
        ...(isDevelopment && error instanceof Error ? { detail: error.message } : {}),
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      message: SERVER_ERROR_MESSAGE,
      code: 'AUTH_INTERNAL_ERROR',
      ...(isDevelopment && error instanceof Error ? { detail: error.message } : {}),
    },
    { status: 500 },
  )
}

export async function POST(request: Request) {
  let fromForm = false

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Environment variable not found: DATABASE_URL')
    }

    const parsedCredentials = await parseCredentials(request)
    fromForm = parsedCredentials.fromForm
    const normalizedEmail = normalizeEmail(parsedCredentials.email)
    const password = parsedCredentials.password

    if (!normalizedEmail || !password) {
      if (fromForm) {
        return NextResponse.redirect(new URL('/login?error=missing', request.url))
      }

      return NextResponse.json({ message: 'Email ve sifre zorunludur' }, { status: 400 })
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    })

    if (!adminUser || !adminUser.isActive) {
      if (fromForm) {
        return NextResponse.redirect(new URL('/login?error=invalid', request.url))
      }

      return NextResponse.json({ message: INVALID_CREDENTIALS_MESSAGE }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, adminUser.passwordHash)
    if (!isValidPassword) {
      if (fromForm) {
        return NextResponse.redirect(new URL('/login?error=invalid', request.url))
      }

      return NextResponse.json({ message: INVALID_CREDENTIALS_MESSAGE }, { status: 401 })
    }

    const { token, expiresAt } = await createAdminSession(adminUser.id)
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    })

    if (fromForm) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt))
      return response
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt))
    return response
  } catch (error) {
    return buildServerErrorResponse(request, fromForm, error)
  }
}
