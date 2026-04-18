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
  proposal: PrismaProposalModel & { client: { id: string; companyName: string; instagram: string | null; contactPerson: string; email: string | null; phone: string } | null }
): Proposal {
  const fallbackClientName = proposal.clientCompanyName ?? 'Yeni Müşteri'
  const clientName = proposal.client?.companyName ?? fallbackClientName
  const clientInstagram = proposal.client?.instagram ?? proposal.clientInstagram ?? ''
  const clientContact = proposal.client?.contactPerson ?? proposal.clientContactPerson ?? ''
  const clientEmail = proposal.client?.email ?? proposal.clientEmail ?? ''
  const clientPhone = proposal.client?.phone ?? proposal.clientPhone ?? ''

  return {
    id: proposal.id,
    title: proposal.title,
    client: clientName,
    clientId: proposal.clientId,
    clientInstagram,
    clientContact,
    clientEmail,
    clientPhone,
    amount: Number(proposal.amount.toString()),
    sentDate: toDateString(proposal.sentDate),
    status: statusToUi[proposal.status],
    followUp: toDateString(proposal.followUpDate),
    notes: proposal.notes ?? '',
  }
}

export function mapPrismaProposalToEditable(proposal: PrismaProposalModel) {
  const hasManualClient = !proposal.clientId

  return {
    title: proposal.title,
    clientMode: hasManualClient ? 'new' : 'existing',
    clientId: proposal.clientId ?? '',
    newClientCompany: proposal.clientCompanyName ?? '',
    newClientContact: proposal.clientContactPerson ?? '',
    newClientEmail: proposal.clientEmail ?? '',
    newClientPhone: proposal.clientPhone ?? '',
    newClientInstagram: proposal.clientInstagram ?? '',
    amount: Number(proposal.amount.toString()),
    sentDate: toDateString(proposal.sentDate) ?? '',
    status: statusToUi[proposal.status],
    followUp: toDateString(proposal.followUpDate) ?? '',
    notes: proposal.notes ?? '',
  }
}
