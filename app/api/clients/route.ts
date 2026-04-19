import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaClientToClientSummary, mapServiceToPrisma, mapStatusToPrisma } from '@/features/clients/mappers'
import { normalizeEmail, normalizeInstagram, normalizeLocation, normalizeWebsite, normalizeWhatsApp } from '@/features/clients/normalizers'
import { clientPayloadSchema } from '@/features/clients/schemas'
import { createCrudNotification } from '@/lib/notifications'

export async function GET() {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          select: {
            status: true,
          },
        },
        payments: {
          select: {
            amount: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(clients.map(mapPrismaClientToClientSummary))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
      return NextResponse.json({ message: 'Client schema is out of sync with the database. Please apply the latest Prisma schema changes.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Failed to load clients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const body = await request.json()
  const parsed = clientPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const created = await prisma.client.create({
      data: {
        companyName: parsed.data.company,
        contactPerson: parsed.data.contact,
        email: normalizeEmail(parsed.data.email),
        phone: parsed.data.phone,
        location: normalizeLocation(parsed.data.location),
        instagram: normalizeInstagram(parsed.data.instagram),
        whatsapp: normalizeWhatsApp(parsed.data.whatsapp),
        website: normalizeWebsite(parsed.data.website),
        serviceType: mapServiceToPrisma(parsed.data.service),
        status: mapStatusToPrisma(parsed.data.status),
        notes: parsed.data.notes || null,
      },
      include: {
        projects: {
          select: {
            status: true,
          },
        },
        payments: {
          select: {
            amount: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    })

    await createCrudNotification({
      action: 'created',
      entityType: 'CLIENT',
      entityId: created.id,
      entityLabel: 'Müşteri',
      detail: created.companyName,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaClientToClientSummary(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
    }

    return NextResponse.json({ message: 'Failed to create client' }, { status: 500 })
  }
}

