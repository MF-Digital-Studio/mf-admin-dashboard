import { ProposalsPage } from '@/features/proposals/proposals-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function ProposalsRoutePage() {
  await requireAdminPageAccess()
  return <ProposalsPage />
}
