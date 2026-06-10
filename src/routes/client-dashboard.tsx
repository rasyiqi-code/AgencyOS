import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { getSystemSettings, getPageSeoFn } from '@/src/server/settings'
import { ClientDashboardContent } from '@/components/public/client-dashboard-content'
import { type SystemSetting } from '@prisma/client'

const loader = async () => {
  const settings = await getSystemSettings({ data: ['AGENCY_NAME'] })
  const pageSeo = await getPageSeoFn({ data: '/client-dashboard' })
  return { settings, pageSeo }
}

export const Route = createFileRoute('/client-dashboard')({
  loader,
  head: ({ loaderData }) => {
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'Client Dashboard'
    const description = pageSeo?.description || 'Transparent project tracking, direct communication with engineers, and no-meeting workflow.'
    const ogImage = pageSeo?.ogImage || undefined
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
      ],
    }
  },
  component: ClientDashboardPage,
})

function ClientDashboardPage() {
  const { settings } = useLoaderData({ from: Route.id })
  const agencyName = settings?.find((s: SystemSetting) => s.key === 'AGENCY_NAME')?.value || 'Agency OS'

  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />
      <ClientDashboardContent agencyName={agencyName} />
      <SiteFooter />
    </div>
  )
}
