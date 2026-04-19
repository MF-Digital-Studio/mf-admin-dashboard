import { ClientsPage } from '@/features/clients/clients-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function ClientsRoutePage() {
  await requireAdminPageAccess()
  return <ClientsPage />
}
