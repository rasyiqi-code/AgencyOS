import { createFileRoute } from '@tanstack/react-router'
import { getAdminTeamFn } from "@/src/server/team"
import { TeamTable } from "@/components/admin/team/team-table"
import { ShieldAlert } from "lucide-react"

export const Route = createFileRoute('/admin/team')({
  loader: async () => {
    return await getAdminTeamFn()
  },
  component: AdminTeamPage,
})

function AdminTeamPage() {
  const result = Route.useLoaderData()

  if (!result.success && result.error === 'Forbidden') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
        <p className="text-zinc-400 max-w-md">
          Only Super Admins (defined in system environment) can manage team roles.
          Please contact the site owner.
        </p>
      </div>
    )
  }

  const teamMembers = result.teamMembers || []
  const currentUserId = result.currentUserId || undefined

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Team & Roles
          </h1>
          <p className="text-zinc-400">
            Manage internal staff roles and permissions.
          </p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-2">
          <div className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mb-0.5">Super Admin Mode</div>
          <div className="text-sm font-medium text-white">Full Access</div>
        </div>
      </div>

      <TeamTable data={teamMembers} currentUserId={currentUserId} />
    </div>
  )
}
