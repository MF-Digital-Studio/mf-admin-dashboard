export type ProposalStatus = 'Draft' | 'Sent' | 'Under Review' | 'Accepted' | 'Rejected'

export interface Proposal {
  id: string
  title: string
  client: string
  amount: number
  sentDate: string | null
  status: ProposalStatus
  followUp: string | null
}

export interface PipelineStage {
  stage: string
  count: number
  value: number
}

