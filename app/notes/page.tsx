import { NotesPage } from '@/features/notes/notes-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function NotesRoutePage() {
  await requireAdminPageAccess()
  return <NotesPage />
}
