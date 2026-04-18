import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaProposalToEditable, mapPrismaProposalToProposal, mapProposalStatusToPrisma } from '@/features/proposals/mappers'
import { proposalPatchPayloadSchema } from '@/features/proposals/schemas'
import { createCrudNotification } from '@/lib/notifications'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const proposal = await prisma.proposal.findUnique({
    where: { id },
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

  if (!proposal) {
    return NextResponse.json({ message: 'Proposal not found' }, { status: 404 })
  }

  return NextResponse.json({
    proposal: mapPrismaProposalToProposal(proposal),
    editable: mapPrismaProposalToEditable(proposal),
  })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const parsed = proposalPatchPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: 'At least one field is required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (parsed.data.title !== undefined) data.title = parsed.data.title
  if (parsed.data.clientMode !== undefined) {
    if (parsed.data.clientMode === 'existing') {
      data.clientId = parsed.data.clientId ?? null
      data.clientCompanyName = null
      data.clientContactPerson = null
      data.clientEmail = null
      data.clientPhone = null
      data.clientInstagram = null
    } else {
      data.clientId = null
      data.clientCompanyName = parsed.data.newClientCompany ?? null
      data.clientContactPerson = parsed.data.newClientContact ?? null
      data.clientEmail = parsed.data.newClientEmail ?? null
      data.clientPhone = parsed.data.newClientPhone ?? null
      data.clientInstagram = parsed.data.newClientInstagram ?? null
    }
  } else {
    if (parsed.data.clientId !== undefined) data.clientId = parsed.data.clientId
    if (parsed.data.newClientCompany !== undefined) data.clientCompanyName = parsed.data.newClientCompany
    if (parsed.data.newClientContact !== undefined) data.clientContactPerson = parsed.data.newClientContact
    if (parsed.data.newClientEmail !== undefined) data.clientEmail = parsed.data.newClientEmail
    if (parsed.data.newClientPhone !== undefined) data.clientPhone = parsed.data.newClientPhone
    if (parsed.data.newClientInstagram !== undefined) data.clientInstagram = parsed.data.newClientInstagram
  }
  if (parsed.data.amount !== undefined) data.amount = parsed.data.amount
  if (parsed.data.sentDate !== undefined) data.sentDate = parsed.data.sentDate ? new Date(parsed.data.sentDate) : null
  if (parsed.data.status !== undefined) data.status = mapProposalStatusToPrisma(parsed.data.status)
  if (parsed.data.followUp !== undefined) data.followUpDate = parsed.data.followUp ? new Date(parsed.data.followUp) : null
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null

  try {
    const updated = await prisma.proposal.update({
      where: { id },
      data,
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
      action: 'updated',
      entityType: 'PROPOSAL',
      entityId: updated.id,
      entityLabel: 'Teklif',
      detail: updated.title,
    }).catch(() => undefined)

    return NextResponse.json(mapPrismaProposalToProposal(updated))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025' || error.code === 'P2003') {
        return NextResponse.json({ message: 'Proposal or client not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Failed to update proposal' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params

  try {
    const deleted = await prisma.proposal.delete({
      where: { id },
    })

    await createCrudNotification({
      action: 'deleted',
      entityType: 'PROPOSAL',
      entityId: deleted.id,
      entityLabel: 'Teklif',
      detail: deleted.title,
    }).catch(() => undefined)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to delete proposal' }, { status: 500 })
  }
}
