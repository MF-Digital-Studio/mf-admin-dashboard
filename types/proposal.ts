export type ProposalStatus = 'Draft' | 'Sent' | 'Under Review' | 'Accepted' | 'Rejected'

export interface Proposal {
  id: string
  title: string
  client: string
  clientId: string | null
  clientInstagram?: string
  clientContact?: string
  clientEmail?: string
  clientPhone?: string
  amount: number
  sentDate: string | null
  status: ProposalStatus
  followUp: string | null
  notes?: string
}

export interface PipelineStage {
  stage: string
  count: number
  value: number
}
