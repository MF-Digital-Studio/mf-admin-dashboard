import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createCrudNotification } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(_: Request, { params }: Params) {
  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      clientId: true,
      clientCompanyName: true,
      clientContactPerson: true,
      clientEmail: true,
      clientPhone: true,
      clientInstagram: true,
      notes: true,
    },
  })

  if (!proposal) {
    return NextResponse.json({ message: 'Proposal not found' }, { status: 404 })
  }

  if (proposal.clientId) {
    const existing = await prisma.client.findUnique({
      where: { id: proposal.clientId },
      select: { id: true, companyName: true },
    })
    return NextResponse.json({ ok: true, alreadyLinked: true, client: existing })
  }

  if (proposal.status !== 'ACCEPTED') {
    return NextResponse.json({ message: 'Only accepted proposals can be converted' }, { status: 400 })
  }

  if (!proposal.clientCompanyName || !proposal.clientContactPerson || !proposal.clientEmail || !proposal.clientPhone) {
    return NextResponse.json({ message: 'Manual proposal client info is incomplete' }, { status: 400 })
  }

  let client = null as { id: string; companyName: string } | null

  try {
    client = await prisma.client.create({
      data: {
        companyName: proposal.clientCompanyName,
        contactPerson: proposal.clientContactPerson,
        email: proposal.clientEmail,
        phone: proposal.clientPhone,
        instagram: proposal.clientInstagram || null,
        serviceType: 'WEB_DESIGN',
        status: 'LEAD',
        notes: proposal.notes || `Converted from accepted proposal: ${proposal.title}`,
      },
      select: {
        id: true,
        companyName: true,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      client = await prisma.client.findUnique({
        where: { email: proposal.clientEmail },
        select: { id: true, companyName: true },
      })
    } else {
      return NextResponse.json({ message: 'Failed to convert proposal client' }, { status: 500 })
    }
  }

  if (!client) {
    return NextResponse.json({ message: 'Failed to resolve client conversion' }, { status: 500 })
  }

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { clientId: client.id },
  })

  await createCrudNotification({
    action: 'created',
    entityType: 'CLIENT',
    entityId: client.id,
    entityLabel: 'Müşteri',
    detail: `${client.companyName} (Teklif dönüşümü)`,
  }).catch(() => undefined)

  return NextResponse.json({ ok: true, converted: true, client })
}
