import { createFileRoute, redirect, Outlet, Link } from '@tanstack/react-router'
import { hexclaveClientApp } from '@/lib/config/hexclave-client'
import { Shield, LogOut } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header/main'
import { isAdminFn, canManageProjectsFn, canManageBillingFn } from '@/src/server/auth'
import { AdminSidebarNavigation } from '@/components/admin/admin-sidebar-navigation'
import { SidebarContainer } from '@/components/dashboard/sidebar/container'
import { SidebarContentWrapper } from '@/components/dashboard/sidebar/content-wrapper'
import { Badge } from '@/components/ui/badge'
import { getSystemSettings } from '@/src/server/settings'
import { SystemAlerts } from '@/components/admin/system-alerts'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await hexclaveClientApp.getUser()
    if (!user) {
      // Menggunakan href agar tidak memicu type error di rute statis
      throw redirect({ href: '/handler/sign-in' })
    }
    if (!await isAdminFn()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async () => {
    const settings = await getSystemSettings({ data: ['AGENCY_NAME', 'LOGO_URL'] })
    const agencyName = settings.find(s => s.key === 'AGENCY_NAME')?.value || 'Agency OS'
    const logoUrl = settings.find(s => s.key === 'LOGO_URL')?.value
    const pmAccess = await canManageProjectsFn()
    const financeAccess = await canManageBillingFn()
    return { agencyName, logoUrl, pmAccess, financeAccess }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { agencyName, logoUrl, pmAccess, financeAccess } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <SidebarContainer
        header={
          <Link to="/admin" className="flex items-center gap-2 group">
            {logoUrl ? (
              <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                <img
                  src={logoUrl}
                  alt={agencyName}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-sm font-bold text-white truncate max-w-[140px] leading-tight">
                {agencyName}
              </span>
              <div className="flex">
                <Badge variant="outline" className="h-[18px] px-1.5 text-[9px] uppercase tracking-widest border-red-500/50 text-red-500 bg-red-500/10 font-black">
                  Admin
                </Badge>
              </div>
            </div>
          </Link>
        }
        footer={
          <Link
            to="/dashboard"
            className="flex w-full items-center gap-3 rounded-lg px-5 py-2 text-zinc-500 transition-all hover:text-white hover:bg-white/5"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate transition-all duration-300">
              Exit to Client View
            </span>
          </Link>
        }
      >
        <AdminSidebarNavigation
          pmAccess={pmAccess}
          financeAccess={financeAccess}
        />
      </SidebarContainer>

      <SidebarContentWrapper>
        <DashboardHeader
          agencyName={agencyName}
          logoUrl={logoUrl ?? undefined}
          navChildren={<AdminSidebarNavigation pmAccess={pmAccess} financeAccess={financeAccess} />}
          navFooter={
            <Link
              to="/dashboard"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-white hover:bg-white/5"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Exit to Client View</span>
            </Link>
          }
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 min-w-0">
          <SystemAlerts />
          <Outlet />
        </main>
      </SidebarContentWrapper>
    </div>
  )
}


