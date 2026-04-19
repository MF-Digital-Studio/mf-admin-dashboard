import { OverviewPage } from '@/features/dashboard/overview-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function DashboardPage() {
  await requireAdminPageAccess()
  return <OverviewPage />
}
