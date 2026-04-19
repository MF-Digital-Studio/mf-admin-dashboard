import { SettingsPage } from '@/features/settings/settings-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function SettingsRoutePage() {
  await requireAdminPageAccess()
  return <SettingsPage />
}
