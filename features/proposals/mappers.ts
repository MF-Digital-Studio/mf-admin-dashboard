import type { Proposal as PrismaProposalModel, ProposalStatus as PrismaProposalStatus } from '@prisma/client'
import type { Proposal, ProposalStatus } from '@/types'

const statusToUi: Record<PrismaProposalStatus, ProposalStatus> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}

const statusToPrisma: Record<ProposalStatus, PrismaProposalStatus> = {
  Draft: 'DRAFT',
  Sent: 'SENT',
  'Under Review': 'UNDER_REVIEW',
  Accepted: 'ACCEPTED',
  Rejected: 'REJECTED',
}

function toDateString(value: Date | null | undefined): string | null {
  if (!value) {
    return null
  }

  return value.toISOString().slice(0, 10)
}

export function mapProposalStatusToPrisma(value: ProposalStatus): PrismaProposalStatus {
  return statusToPrisma[value]
}

export function mapPrismaProposalToProposal(
  proposal: PrismaProposalModel & { client: { id: string; companyName: string } }
): Proposal {
  return {
    id: proposal.id,
    title: proposal.title,
    client: proposal.client.companyName,
    clientId: proposal.clientId,
    amount: Number(proposal.amount.toString()),
    sentDate: toDateString(proposal.sentDate),
    status: statusToUi[proposal.status],
    followUp: toDateString(proposal.followUpDate),
    notes: proposal.notes ?? '',
  }
}

export function mapPrismaProposalToEditable(proposal: PrismaProposalModel) {
  return {
    title: proposal.title,
    clientId: proposal.clientId,
    amount: Number(proposal.amount.toString()),
    sentDate: toDateString(proposal.sentDate) ?? '',
    status: statusToUi[proposal.status],
    followUp: toDateString(proposal.followUpDate) ?? '',
    notes: proposal.notes ?? '',
  }
}
