import { createFileRoute, Link } from '@tanstack/react-router'
import { getDashboardData } from '@/src/server/dashboard'
import { OverviewHeader } from '@/components/dashboard/header/overview'
import { MissionCard } from '@/components/dashboard/missions/card'
import { FinanceWidget } from '@/components/dashboard/widgets/finance'
import { QuickActions } from '@/components/dashboard/widgets/quick-actions'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    return getDashboardData()
  },
  component: DashboardHome,
})

function DashboardHome() {
  const initialData = Route.useLoaderData()
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    initialData,
  })

  if (!data) {
    return <div className="text-zinc-500 p-8">Please sign in to view your dashboard.</div>
  }

  const { displayName, projects, totalInvestment, nextInvoice } = data
  const activeProject = projects.find(p => p.status === 'dev')

  return (
    <div className="pb-10">
      <OverviewHeader user={{ displayName }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeProject && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">Active Mission</h2>
                <span className="text-xs font-mono text-yellow-500 animate-pulse">● Live Update</span>
              </div>
              <MissionCard project={activeProject} />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Missions</h2>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
                <p className="text-zinc-500">No missions yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.filter(p => p.id !== activeProject?.id).map(project => (
                  <MissionCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Meng-cast nextInvoice ke any karena createdAt bertipe string setelah serialisasi server function */}
          <FinanceWidget totalInvestment={totalInvestment} nextInvoice={nextInvoice as any} />

          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
            <QuickActions />
          </div>

          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
            <h4 className="font-bold text-yellow-500 mb-2">Need Assistance?</h4>
            <p className="text-sm text-yellow-500/70 mb-4">
              Our AI helper is available 24/7 to assist you with your projects.
            </p>
            <Link
              href="/dashboard/inbox"
              className="text-xs bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold px-4 py-2 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
            >
              Open Communications
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
