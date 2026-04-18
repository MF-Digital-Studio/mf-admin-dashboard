import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaProposalToEditable, mapPrismaProposalToProposal, mapProposalStatusToPrisma } from '@/features/proposals/mappers'
import { proposalPayloadSchema } from '@/features/proposals/schemas'
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
  const parsed = proposalPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        title: parsed.data.title,
        clientId: parsed.data.clientId,
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

    return NextResponse.json({ message: 'Failed to update proposal' }, { status: 500 })
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
