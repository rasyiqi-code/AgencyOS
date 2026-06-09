import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { canManageProjects, canManageBilling } from '@/lib/shared/auth-helpers'
import { getSuperAdminDashboardData, getBillingDashboardData, getProjectDashboardData } from '@/src/server/admin'
import { SuperAdminDashboardView } from '@/components/admin/views/super-admin-view'
import { BillingDashboardView } from '@/components/admin/views/billing-view'
import { ProjectDashboardView } from '@/components/admin/views/project-view'
import { DashboardModeSwitcher } from '@/components/admin/dashboard-mode-switcher'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Schema untuk memvalidasi query search parameters
const adminSearchSchema = z.object({
  view: z.string().optional(),
  mode: z.string().optional(),
})

export const Route = createFileRoute('/admin/')({
  validateSearch: (search) => adminSearchSchema.parse(search),
  loaderDeps: ({ search: { view, mode } }) => ({ view, mode }),
  loader: async ({ deps }) => {
    // Memeriksa peran admin saat ini
    const isProjectAdmin = await canManageProjects()
    const isBillingAdmin = await canManageBilling()

    const mode = deps.mode || 'services'
    const view = deps.view

    let activeView = 'fallback'
    if (isProjectAdmin && isBillingAdmin) {
      if (view === 'finance') activeView = 'finance'
      else if (view === 'project') activeView = 'project'
      else activeView = 'super'
    } else if (isBillingAdmin) {
      activeView = 'finance'
    } else if (isProjectAdmin) {
      activeView = 'project'
    }

    // Memuat data secara dinamis berdasarkan dashboard aktif
    let superAdminStats = null
    let billingStats = null
    let projectStats = null

    if (activeView === 'super') {
      superAdminStats = await getSuperAdminDashboardData({ data: mode })
    } else if (activeView === 'finance') {
      billingStats = await getBillingDashboardData({ data: mode })
    } else if (activeView === 'project') {
      projectStats = await getProjectDashboardData()
    }

    // Deteksi locale secara aman
    const locale = 'en'
    return {
      isProjectAdmin,
      isBillingAdmin,
      activeView,
      superAdminStats,
      billingStats,
      projectStats,
      locale,
      search: { view, mode },
    }
  },
  component: AdminHome,
})

function AdminHome() {
  const {
    isProjectAdmin,
    isBillingAdmin,
    activeView,
    superAdminStats,
    billingStats,
    projectStats,
    locale,
    search,
  } = Route.useLoaderData()

  const navigate = useNavigate()
  const currentView = search.view || 'super'

  const handleViewChange = (val: string) => {
    navigate({
      search: { ...search, view: val === 'super' ? undefined : val } as any,
    })
  }

  // Merender tab switcher jika user adalah Super Admin (memiliki akses PM & Finance)
  const renderSuperAdminSwitcher = () => {
    if (!(isProjectAdmin && isBillingAdmin)) return null

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 mb-2">
        <Tabs value={currentView} onValueChange={handleViewChange} className="w-full sm:w-auto">
          <TabsList className="bg-zinc-900 border border-white/5 p-1 rounded-xl h-11">
            <TabsTrigger value="super" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs font-bold gap-2 px-4 rounded-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs font-bold gap-2 px-4 rounded-lg">
              Keuangan
            </TabsTrigger>
            <TabsTrigger value="project" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs font-bold gap-2 px-4 rounded-lg">
              Proyek
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Tampilkan switcher mode (Services vs Digital) jika di view Super Admin atau Keuangan */}
        {currentView !== 'project' && <DashboardModeSwitcher />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {renderSuperAdminSwitcher()}
      
      {/* Tampilkan mode switcher saja jika bukan super admin tapi memiliki akses keuangan */}
      {!renderSuperAdminSwitcher() && activeView === 'finance' && (
        <div className="flex justify-end mb-2">
          <DashboardModeSwitcher />
        </div>
      )}

      {/* Render view yang sesuai */}
      {activeView === 'super' && superAdminStats && (
        <SuperAdminDashboardView mode={search.mode} stats={superAdminStats} />
      )}

      {activeView === 'finance' && billingStats && (
        <BillingDashboardView mode={search.mode} locale={locale} stats={billingStats} />
      )}

      {activeView === 'project' && projectStats && (
        <ProjectDashboardView locale={locale} stats={projectStats} />
      )}

      {activeView === 'fallback' && (
        <div className="py-10 text-center">
          <h1 className="text-xl text-zinc-400">Selamat datang di Panel Admin</h1>
          <p className="text-sm text-zinc-500">Peran Anda memiliki akses terbatas. Silakan periksa sidebar untuk aksi yang tersedia.</p>
        </div>
      )}
    </div>
  )
}
