import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaProposalToProposal, mapProposalStatusToPrisma } from '@/features/proposals/mappers'
import { proposalPayloadSchema } from '@/features/proposals/schemas'
import { createCrudNotification } from '@/lib/notifications'

export async function GET() {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const proposals = await prisma.proposal.findMany({
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          instagram: true,
          contactPerson: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(proposals.map(mapPrismaProposalToProposal))
}

export async function POST(request: Request) {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }
  const body = await request.json()
  const parsed = proposalPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const created = await prisma.proposal.create({
      data: {
        title: parsed.data.title,
        clientId: parsed.data.clientMode === 'existing' ? parsed.data.clientId : null,
        clientCompanyName: parsed.data.clientMode === 'new' ? parsed.data.newClientCompany : null,
        clientContactPerson: parsed.data.clientMode === 'new' ? parsed.data.newClientContact : null,
        clientEmail: parsed.data.clientMode === 'new' ? parsed.data.newClientEmail : null,
        clientPhone: parsed.data.clientMode === 'new' ? parsed.data.newClientPhone : null,
        clientInstagram: parsed.data.clientMode === 'new' ? parsed.data.newClientInstagram : null,
        amount: parsed.data.amount,
        sentDate: parsed.data.sentDate ? new Date(parsed.data.sentDate) : null,
        status: mapProposalStatusToPrisma(parsed.data.status),
        followUpDate: parsed.data.followUp ? new Date(parsed.data.followUp) : null,
        notes: parsed.data.notes || null,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            instagram: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    await createCrudNotification({
      action: 'created',
      entityType: 'PROPOSAL',
      entityId: created.id,
      entityLabel: 'Teklif',
      detail: created.title,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaProposalToProposal(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to create proposal' }, { status: 500 })
  }
}

