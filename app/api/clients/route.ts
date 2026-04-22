import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { findDuplicateField, getDuplicateMessage } from '@/features/clients/duplicate-check'
import { mapPrismaClientToClientSummary, mapServiceToPrisma, mapStatusToPrisma } from '@/features/clients/mappers'
import { normalizeCategory, normalizeEmail, normalizeInstagram, normalizeLocation, normalizeWebsite, normalizeWhatsApp } from '@/features/clients/normalizers'
import { clientPayloadSchema } from '@/features/clients/schemas'
import { createCrudNotification } from '@/lib/notifications'

const CLIENT_LABEL = '\u004d\u00fc\u015fteri'

function isMissingClientCategoryColumn(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2022') {
    return false
  }

  const column = typeof error.meta?.column === 'string' ? error.meta.column : ''
  return column.includes('Client') && column.includes('category')
}

async function ensureClientCategoryColumn(): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "public"."Client" ADD COLUMN IF NOT EXISTS "category" TEXT')
    return true
  } catch {
    return false
  }
}

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
    if (isMissingClientCategoryColumn(error)) {
      const fixed = await ensureClientCategoryColumn()
      if (fixed) {
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
      }

      const legacyClients = await prisma.client.findMany({
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
          email: true,
          instagram: true,
          whatsapp: true,
          website: true,
          location: true,
          serviceType: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
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

      return NextResponse.json(
        legacyClients.map((client) =>
          mapPrismaClientToClientSummary({ ...client, category: null } as Parameters<typeof mapPrismaClientToClientSummary>[0])
        )
      )
    }

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

  const existingClients = await prisma.client.findMany({
    select: {
      id: true,
      companyName: true,
      email: true,
      phone: true,
      whatsapp: true,
    },
  })

  const duplicateField = findDuplicateField(existingClients, {
    companyName: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp,
  })

  if (duplicateField) {
    return NextResponse.json({ message: getDuplicateMessage(duplicateField) }, { status: 409 })
  }

  try {
    const created = await prisma.client.create({
      data: {
        companyName: parsed.data.company,
        contactPerson: parsed.data.contact,
        email: normalizeEmail(parsed.data.email),
        phone: parsed.data.phone ?? '',
        location: normalizeLocation(parsed.data.location),
        category: normalizeCategory(parsed.data.category),
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
      entityLabel: CLIENT_LABEL,
      detail: created.companyName,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaClientToClientSummary(created), { status: 201 })
  } catch (error) {
    if (isMissingClientCategoryColumn(error)) {
      const fixed = await ensureClientCategoryColumn()
      if (fixed) {
        const created = await prisma.client.create({
          data: {
            companyName: parsed.data.company,
            contactPerson: parsed.data.contact,
            email: normalizeEmail(parsed.data.email),
            phone: parsed.data.phone ?? '',
            location: normalizeLocation(parsed.data.location),
            category: normalizeCategory(parsed.data.category),
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
          entityLabel: CLIENT_LABEL,
          detail: created.companyName,
        }).catch(() => undefined)

        return NextResponse.json(mapPrismaClientToClientSummary(created), { status: 201 })
      }

      return NextResponse.json({ message: 'Client category column is missing in database. Please run latest Prisma migration.' }, { status: 409 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
    }

    return NextResponse.json({ message: 'Failed to create client' }, { status: 500 })
  }
}
