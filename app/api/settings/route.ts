import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SETTINGS_ID = 'site'
const DEFAULT_SETTINGS = {
  agencyName: 'MF Digital Studio',
  email: 'info@mfdigital.com',
  phone: '+90 555 000 0000',
  website: 'https://mfdigital.com',
  defaultCurrency: 'TRY',
}

function normalizeCurrency(value: unknown): 'TRY' | 'USD' | 'EUR' {
  const raw = String(value ?? '').trim().toUpperCase()
  if (raw === 'USD' || raw === 'DOLAR') return 'USD'
  if (raw === 'EUR' || raw === 'EURO') return 'EUR'
  return 'TRY'
}

export async function GET() {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    })

    if (!settings) {
      return NextResponse.json({ agencyName: DEFAULT_SETTINGS.agencyName, defaultCurrency: DEFAULT_SETTINGS.defaultCurrency })
    }

    return NextResponse.json({
      agencyName: settings.agencyName,
      defaultCurrency: normalizeCurrency(settings.defaultCurrency),
    })
  } catch {
    return NextResponse.json({ agencyName: DEFAULT_SETTINGS.agencyName, defaultCurrency: DEFAULT_SETTINGS.defaultCurrency })
  }
}

export async function PATCH(request: Request) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const body = await request.json().catch(() => ({}))
  const data: Partial<{
    agencyName: string
    email: string
    phone: string
    website: string
    defaultCurrency: string
  }> = {}

  if (body.agencyName !== undefined) data.agencyName = String(body.agencyName)
  if (body.email !== undefined) data.email = String(body.email)
  if (body.phone !== undefined) data.phone = String(body.phone)
  if (body.website !== undefined) data.website = String(body.website)
  if (body.defaultCurrency !== undefined) data.defaultCurrency = normalizeCurrency(body.defaultCurrency)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: 'No settings provided' }, { status: 400 })
  }

  try {
    const updated = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: {
        id: SETTINGS_ID,
        agencyName: data.agencyName ?? DEFAULT_SETTINGS.agencyName,
        email: data.email ?? DEFAULT_SETTINGS.email,
        phone: data.phone ?? DEFAULT_SETTINGS.phone,
        website: data.website ?? DEFAULT_SETTINGS.website,
        defaultCurrency: data.defaultCurrency ?? DEFAULT_SETTINGS.defaultCurrency,
      },
    })

    return NextResponse.json({
      agencyName: updated.agencyName,
      defaultCurrency: normalizeCurrency(updated.defaultCurrency),
    })
  } catch {
    return NextResponse.json(
      {
        message: 'Failed to save settings',
      },
      { status: 500 }
    )
  }
}

