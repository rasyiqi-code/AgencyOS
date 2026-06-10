import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { getClientMissionsFn } from '@/src/server/client-dashboard'
import { MissionCard } from '@/components/dashboard/missions/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

// Schema untuk memvalidasi parameter pencarian
const searchSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute('/dashboard/missions')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps: { q } }) => {
    return await getClientMissionsFn({ data: { q } })
  },
  component: MissionsPage,
})

function MissionsPage() {
  const { allProjects, locale, success, error } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchQuery, setSearchQuery] = useState(search.q || '')

  const isId = locale === 'id-ID' || locale === 'id'

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || (isId ? 'Gagal memuat misi' : 'Failed to load missions')}
      </div>
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: (prev) => ({
        ...prev,
        q: searchQuery || undefined,
      }),
    })
  }

  // Filter proyek aktif vs riwayat
  const subscribedProjects = allProjects.filter(
    (p: any) =>
      (p.subscriptionStatus === 'active' && !p.estimateId) ||
      (p.service && p.service.interval !== 'one_time')
  )
  const historyProjects = allProjects.filter(
    (p: any) =>
      (p.subscriptionStatus !== 'active' || !!p.estimateId) &&
      !(p.service && p.service.interval !== 'one_time')
  )

  return (
    <div className="pb-6 w-full text-left">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input
              name="q"
              placeholder={isId ? 'Cari misi...' : 'Search missions...'}
              className="bg-zinc-900/50 border-white/10 pl-8 w-full h-8 text-xs focus-visible:ring-1 focus-visible:ring-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Link to="/price-calculator">
            <Button size="sm" className="bg-white text-black hover:bg-zinc-200 font-semibold cursor-pointer h-8 text-xs">
              {isId ? '+ Misi Baru' : '+ New Mission'}
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-white/5 mb-4 h-9 p-0.5">
          <TabsTrigger
            value="subscriptions"
            className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-xs px-3 py-1"
          >
            {isId ? 'Langganan Aktif' : 'Active Subscriptions'}
            {subscribedProjects.length > 0 && (
              <span className="ml-1.5 bg-black/20 text-[9px] px-1.5 py-0.5 rounded-full">
                {subscribedProjects.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-3 py-1"
          >
            {isId ? 'Riwayat & Proyek' : 'History & Projects'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-0">
          {subscribedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
              <p className="text-zinc-500 text-sm">
                {isId ? 'Tidak ada langganan aktif saat ini.' : 'No active subscriptions found.'}
              </p>
              <Link to="/dashboard/services">
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white h-8 text-xs">
                  {isId ? 'Jelajahi Layanan' : 'Browse Services'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribedProjects.map((project: any) => (
                <MissionCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          {historyProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
              <p className="text-zinc-500 text-sm">
                {isId ? 'Tidak ada riwayat proyek yang ditemukan.' : 'No project history found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyProjects.map((project: any) => (
                <MissionCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
