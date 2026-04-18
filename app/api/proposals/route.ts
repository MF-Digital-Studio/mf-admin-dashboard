import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapPrismaProposalToProposal, mapProposalStatusToPrisma } from '@/features/proposals/mappers'
import { proposalPayloadSchema } from '@/features/proposals/schemas'

export async function GET() {
  const proposals = await prisma.proposal.findMany({
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
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
  const body = await request.json()
  const parsed = proposalPayloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  try {
    const created = await prisma.proposal.create({
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

    return NextResponse.json(mapPrismaProposalToProposal(created), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Failed to create proposal' }, { status: 500 })
  }
}
