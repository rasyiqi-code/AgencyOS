import { createFileRoute, Link } from '@tanstack/react-router'
import { getSquadActiveMissions } from '@/src/server/squad'
import { Badge } from '@/components/ui/badge'
import { Code2, Activity, Clock, MessageSquare } from 'lucide-react'

export const Route = createFileRoute('/squad/active')({
  loader: async () => getSquadActiveMissions(),
  component: SquadActivePage,
})

function SquadActivePage() {
  const data = Route.useLoaderData()
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Activity className="w-12 h-12 text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-400">No Active Missions</h2>
        <p className="text-zinc-600 mt-2">Check the mission board for available missions.</p>
        <Link to="/squad" className="mt-4 text-yellow-500 hover:text-yellow-400 underline">
          View Mission Board
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <Activity className="w-6 h-6 text-yellow-500" />
        Active Protocol
      </h1>

      {data.map(app => (
        <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
          <div className="flex items-start justify-between">
            <div>
              {/* Menggunakan title bukan name karena model mission dipetakan dari Project */}
              <h2 className="text-lg font-semibold">{app.mission?.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                  <Code2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {app.mission?.dailyLogs?.[0]?.createdAt
                    ? new Date(app.mission.dailyLogs[0].createdAt).toLocaleDateString()
                    : 'No updates'}
                </span>
              </div>
            </div>
          </div>

          {app.mission?.feedback && app.mission.feedback.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-yellow-500/70 text-sm">
              <MessageSquare className="w-4 h-4" />
              {app.mission.feedback.length} open feedback item(s)
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
