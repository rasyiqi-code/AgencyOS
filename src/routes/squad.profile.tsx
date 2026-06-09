import { createFileRoute } from '@tanstack/react-router'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'
import { Badge } from '@/components/ui/badge'
import { User, Code, Award } from 'lucide-react'

export const Route = createFileRoute('/squad/profile')({
  loader: async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const profile = await prisma.squadProfile.findUnique({
      where: { userId: user.id },
    })

    return { user: { displayName: user.displayName, email: user.primaryEmail }, profile }
  },
  component: SquadProfilePage,
})

function SquadProfilePage() {
  const data = Route.useLoaderData()
  if (!data) return null

  const { user, profile } = data

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
          <User className="w-8 h-8 text-zinc-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.displayName || 'Squad Member'}</h1>
          <p className="text-zinc-400">{user.email}</p>
        </div>
      </div>

      {profile ? (
        <div className="rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-yellow-500" />
              Squad Profile
            </h2>
            <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
              {profile.status}
            </Badge>
          </div>
          {profile.bio && <p className="text-zinc-300">{profile.bio}</p>}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Award className="w-4 h-4" />
            Rating: {(profile as unknown as { rating?: number }).rating ? `${(profile as unknown as { rating: number }).rating.toFixed(1)} / 5.0` : 'N/A'}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
          <p className="text-zinc-500">No squad profile yet.</p>
        </div>
      )}
    </div>
  )
}
