import { FinancePage } from '@/features/finance/finance-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function FinanceRoutePage() {
  await requireAdminPageAccess()
  return <FinancePage />
}
