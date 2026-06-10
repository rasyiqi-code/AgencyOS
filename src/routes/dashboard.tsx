import { createFileRoute, redirect, Outlet, Link } from '@tanstack/react-router'
import { hexclaveClientApp } from '@/lib/config/hexclave-client'
import { Check } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header/main'
import { SidebarContainer } from '@/components/dashboard/sidebar/container'
import { SidebarContentWrapper } from '@/components/dashboard/sidebar/content-wrapper'
import { DashboardSidebarNavigation, DashboardSidebarFooter } from '@/components/dashboard/sidebar/navigation'
import { getSystemSettings } from '@/src/server/settings'


export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await hexclaveClientApp.getUser()
    if (!user) {
      // Menggunakan href agar tidak memicu error tipe rute statis
      throw redirect({ href: '/handler/sign-in' })
    }
  },
  loader: async () => {
    const settings = await getSystemSettings({ data: ['AGENCY_NAME', 'LOGO_URL'] })
    const agencyName = settings.find(s => s.key === 'AGENCY_NAME')?.value || 'Agency OS'
    const logoUrl = settings.find(s => s.key === 'LOGO_URL')?.value
    return { agencyName, logoUrl }
  },
  component: DashboardLayout,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl h-64">
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-zinc-400 text-sm mb-4">The page you are looking for does not exist.</p>
        <Link to="/dashboard" className="text-xs bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          Go to Dashboard
        </Link>
      </div>
    )
  }
})

function DashboardLayout() {
  const { agencyName, logoUrl } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <SidebarContainer
        header={
          <Link to="/" className="flex items-center gap-2 font-semibold">
            {logoUrl ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <img
                  src={logoUrl}
                  alt={agencyName}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 text-yellow-500 stroke-[3]" />
              </div>
            )}
            <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 truncate transition-all duration-300">
              {agencyName}
            </span>
          </Link>
        }
        footer={<DashboardSidebarFooter />}
      >
        <DashboardSidebarNavigation />
      </SidebarContainer>

      <SidebarContentWrapper>
        <DashboardHeader agencyName={agencyName} logoUrl={logoUrl} />
        <main className="grid flex-1 items-start gap-4 p-3 sm:px-4 sm:py-0 md:gap-4">
          <Outlet />
        </main>
      </SidebarContentWrapper>
    </div>
  )
}
