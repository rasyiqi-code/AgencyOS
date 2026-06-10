import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { ExpertsPageContent } from '@/components/public/experts-page-content'
import { getPageSeoFn } from '@/src/server/settings'

const loader = async () => {
  const pageSeo = await getPageSeoFn({ data: '/experts' })
  return { pageSeo }
}

export const Route = createFileRoute('/experts')({
  loader,
  head: ({ loaderData }) => {
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'Our Experts'
    const description = pageSeo?.description || 'Meet our elite team of senior engineers and vetted experts.'
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
  component: ExpertsPage,
})

function ExpertsPage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />
      <div className="pt-24 selection:bg-blue-500/30">
        <ExpertsPageContent />
      </div>
      <SiteFooter />
    </div>
  )
}
