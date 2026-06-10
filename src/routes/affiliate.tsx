import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header/main'
import { SidebarContainer } from '@/components/dashboard/sidebar/container'
import { SidebarContentWrapper } from '@/components/dashboard/sidebar/content-wrapper'
import { AffiliateSidebarNavigation } from '@/components/marketing/affiliate-sidebar-navigation'
import { DashboardSidebarFooter } from '@/components/dashboard/sidebar/navigation'
import { getSystemSettings } from '@/src/server/settings'

export const Route = createFileRoute('/affiliate')({
  loader: async () => {
    return await getSystemSettings({ data: ['AGENCY_NAME', 'LOGO_URL'] })
  },
  component: AffiliateLayout,
})

function AffiliateLayout() {
  const settings = Route.useLoaderData()
  const agencyName = settings?.find((s: any) => s.key === 'AGENCY_NAME')?.value || 'Agency OS'
  const logoUrl = settings?.find((s: any) => s.key === 'LOGO_URL')?.value

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <SidebarContainer
        header={
          <Link to="/" className="flex items-center gap-2 font-semibold text-white hover:text-white/80">
            {logoUrl ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <img
                  src={logoUrl}
                  alt={agencyName}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 text-yellow-500 stroke-[3]" />
              </div>
            )}
            <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 truncate transition-all duration-300">
              {agencyName} <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-2">Partner</span>
            </span>
          </Link>
        }
        footer={<DashboardSidebarFooter />}
      >
        <AffiliateSidebarNavigation />
      </SidebarContainer>

      <SidebarContentWrapper>
        <DashboardHeader navChildren={<AffiliateSidebarNavigation />} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </SidebarContentWrapper>
    </div>
  )
}

