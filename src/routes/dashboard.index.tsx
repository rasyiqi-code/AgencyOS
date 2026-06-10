import { createFileRoute, Link } from '@tanstack/react-router'
import { getDashboardData } from '@/src/server/dashboard'
import { type Order } from '@prisma/client'
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
    <div className="pb-6">
      <OverviewHeader user={{ displayName }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeProject && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white tracking-tight">Active Mission</h2>
                <span className="text-[10px] font-mono text-yellow-500 animate-pulse">● Live Update</span>
              </div>
              <MissionCard project={activeProject} />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Missions</h2>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
                <p className="text-zinc-500 text-sm">No missions yet</p>
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

        <div className="space-y-5">
          <FinanceWidget totalInvestment={totalInvestment} nextInvoice={nextInvoice as unknown as Order} />

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Quick Actions</h3>
            <QuickActions />
          </div>

          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <h4 className="font-bold text-yellow-500 text-sm mb-1.5">Need Assistance?</h4>
            <p className="text-xs text-yellow-500/70 mb-3">
              Our AI helper is available 24/7 to assist you with your projects.
            </p>
            <Link
              to="/dashboard/inbox"
              className="text-[11px] bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold px-3 py-1.5 rounded-lg w-full transition-colors flex items-center justify-center gap-1.5"
            >
              Open Communications
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
