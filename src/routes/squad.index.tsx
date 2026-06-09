import { createFileRoute } from '@tanstack/react-router'
import { getSquadData } from '@/src/server/squad'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Code } from 'lucide-react'
import { InvitationCard } from '@/components/squad/invitation-card'

export const Route = createFileRoute('/squad/')({
  loader: async () => getSquadData(),
  component: SquadPage,
})

interface SquadApplication {
  id: string
  status: string
  mission?: {
    title: string
  } | null
}

function SquadPage() {
  const data = Route.useLoaderData()
  if (!data) return null

  const { profile, availableMissions } = data

  // Memfilter aplikasi bertipe 'invited'
  const invitedMissions = (profile?.applications as SquadApplication[] | undefined)?.filter((app) => app.status === 'invited') || []

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-bold tracking-tight">Squad Mission Board</h1>
          <p className="text-zinc-400 mt-2">Deploy. Build. Deploy.</p>
        </div>

        {/* Tampilkan Undangan yang Tertunda */}
        {invitedMissions.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">Pending Invitations</h2>
            </div>
            <div className="grid gap-3">
              {invitedMissions.map((app) => (
                <InvitationCard
                  key={app.id}
                  applicationId={app.id}
                  missionTitle={app.mission?.title || 'Mission'}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-yellow-500" />
              Available Missions
            </h2>

            {availableMissions.map(mission => (
              <a
                key={mission.id}
                href={`/squad/missions/${mission.id}`}
                className="block"
              >
                <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{mission.title}</h3>
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary">
                          {mission.status}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {/* Menghitung estimasi screen berdasarkan array screens */}
                          {Array.isArray(mission.estimate?.screens) ? `${mission.estimate.screens.length} screens` : 'TBD'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-yellow-500 transition-colors shrink-0" />
                  </div>
                </div>
              </a>
            ))}

            {availableMissions.length === 0 && (
              <div className="text-center py-16 text-zinc-600">
                <p>No missions available right now. Check back soon.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Sisi kanan panel profile atau info */}
            {profile && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6">
                <h3 className="font-bold text-white text-lg mb-2">Operative Profile</h3>
                <p className="text-sm text-zinc-400">Role: <span className="text-white capitalize">{profile.role}</span></p>
                <p className="text-sm text-zinc-400 mt-1">Status: <span className="text-green-400 uppercase font-bold text-xs">{profile.status}</span></p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

