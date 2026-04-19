import { ProjectsPage } from '@/features/projects/projects-page'
import { requireAdminPageAccess } from '@/lib/auth/require-admin-page'

export default async function ProjectsRoutePage() {
  await requireAdminPageAccess()
  return <ProjectsPage />
}
