import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { SiteHeader } from '@/components/landing/site-header'
import { LandingHero } from '@/components/landing/landing-hero'
import { FAQSection } from '@/components/landing/faq-section-fixed'
import { SiteFooter } from '@/components/landing/site-footer'
import { JsonLd } from '@/components/seo/json-ld'
import { getSystemSettings } from '@/lib/server/settings'
import { getPageSeo } from '@/lib/server/seo'
import type { SystemSetting } from '@prisma/client'

const SectionStats = lazy(() => import('@/components/landing/section-stats').then(m => ({ default: m.SectionStats })))
const ExpertProfile = lazy(() => import('@/components/landing/section-expert').then(m => ({ default: m.ExpertProfile })))
const SocialProof = lazy(() => import('@/components/landing/section-social-proof').then(m => ({ default: m.SocialProof })))
const Comparison = lazy(() => import('@/components/landing/section-comparison').then(m => ({ default: m.Comparison })))
const SectionSolutions = lazy(() => import('@/components/landing/section-solutions').then(m => ({ default: m.SectionSolutions })))
const FinancialLogic = lazy(() => import('@/components/landing/section-financial').then(m => ({ default: m.FinancialLogic })))
const Workflow = lazy(() => import('@/components/landing/section-workflow').then(m => ({ default: m.Workflow })))
const Testimonials = lazy(() => import('@/components/landing/section-testimonials').then(m => ({ default: m.Testimonials })))
const SectionGuarantee = lazy(() => import('@/components/landing/section-guarantee').then(m => ({ default: m.SectionGuarantee })))
const ScrollAnimationWrapper = lazy(() => import('@/components/ui/scroll-animation-wrapper').then(m => ({ default: m.ScrollAnimationWrapper })))

const loader = async () => {
  const settings = await getSystemSettings(['AGENCY_NAME', 'AGENCY_LOGO', 'CONTACT_PHONE'])
  const agencyName = settings.find((s: SystemSetting) => s.key === 'AGENCY_NAME')?.value || 'Agency OS'
  const pageSeo = await getPageSeo('/')
  return { settings, agencyName, pageSeo }
}

export const Route = createFileRoute('/')({
  loader,
  head: ({ loaderData }) => {
    // Menggunakan optional chaining untuk mengantisipasi loaderData bernilai undefined saat kompilasi awal
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'AgencyOS'
    const description = pageSeo?.description || ''
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
  component: Home,
})

function Home() {
  const { settings, agencyName } = useLoaderData({ from: Route.id })

  return (
    <main className="relative min-h-screen bg-black selection:bg-blue-500/30">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: agencyName,
          url: process.env.NEXT_PUBLIC_APP_URL || '',
          logo: settings.find((s: SystemSetting) => s.key === 'AGENCY_LOGO')?.value || '',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings.find((s: SystemSetting) => s.key === 'CONTACT_PHONE')?.value || '',
            contactType: 'customer service',
          },
        }}
      />
      <SiteHeader />
      <LandingHero />

      <Suspense fallback={null}>
        <ScrollAnimationWrapper>
          <SectionStats />
        </ScrollAnimationWrapper>
      </Suspense>

      <Suspense fallback={null}>
        <ScrollAnimationWrapper>
          <ExpertProfile />
        </ScrollAnimationWrapper>
      </Suspense>

      <Suspense fallback={null}>
        <ScrollAnimationWrapper delay={0.1}>
          <SocialProof />
        </ScrollAnimationWrapper>
      </Suspense>

      <Suspense fallback={null}>
        <Comparison />
      </Suspense>
      <Suspense fallback={null}>
        <SectionSolutions />
      </Suspense>
      <Suspense fallback={null}>
        <FinancialLogic />
      </Suspense>
      <Suspense fallback={null}>
        <Workflow />
      </Suspense>

      <Suspense fallback={null}>
        <ScrollAnimationWrapper>
          <Testimonials />
        </ScrollAnimationWrapper>
      </Suspense>

      <Suspense fallback={null}>
        <ScrollAnimationWrapper>
          <SectionGuarantee />
        </ScrollAnimationWrapper>
      </Suspense>

      <FAQSection />
      <SiteFooter />
    </main>
  )
}
