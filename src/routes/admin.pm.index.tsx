import { createFileRoute } from '@tanstack/react-router'
import { getProjectDashboardData } from '@/src/server/admin'
import { ProjectDashboardView } from '@/components/admin/views/project-view'

export const Route = createFileRoute('/admin/pm/')({
  loader: async () => {
    return getProjectDashboardData()
  },
  component: AdminPMDashboardRoute,
})

function AdminPMDashboardRoute() {
  const stats = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-4 w-full">
      <ProjectDashboardView locale="id" stats={stats} />
    </div>
  )
}
