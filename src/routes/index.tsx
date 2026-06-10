import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { Suspense } from 'react'
import { SiteHeader } from '@/components/landing/site-header'
import { LandingHero } from '@/components/landing/landing-hero'
import { FAQSection } from '@/components/landing/faq-section-fixed'
import { SiteFooter } from '@/components/landing/site-footer'
import { JsonLd } from '@/components/seo/json-ld'
import { getSystemSettings, getPageSeoFn } from '@/src/server/settings'

type SystemSetting = {
  key: string
  value: string
}

// Impor komponen secara statis untuk menghindari masalah hidrasi (hydration) pada rendering di sisi server (SSR)
import { SectionStats } from '@/components/landing/section-stats'
import { ExpertProfile } from '@/components/landing/section-expert'
import { SocialProof } from '@/components/landing/section-social-proof'
import { Comparison } from '@/components/landing/section-comparison'
import { SectionSolutions } from '@/components/landing/section-solutions'
import { FinancialLogic } from '@/components/landing/section-financial'
import { Workflow } from '@/components/landing/section-workflow'
import { Testimonials } from '@/components/landing/section-testimonials'
import { SectionGuarantee } from '@/components/landing/section-guarantee'
import { ScrollAnimationWrapper } from '@/components/ui/scroll-animation-wrapper'

const loader = async () => {
  const settings = await getSystemSettings({ data: ['AGENCY_NAME', 'AGENCY_LOGO', 'CONTACT_PHONE'] })
  const agencyName = settings.find((s: SystemSetting) => s.key === 'AGENCY_NAME')?.value || 'Agency OS'
  const pageSeo = await getPageSeoFn({ data: '/' })
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
      <LandingHero agencyName={agencyName} />

      {/* Membungkus dengan Suspense agar kegagalan render di satu komponen tidak merusak seluruh halaman */}
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

      <Suspense fallback={null}>
        <FAQSection />
      </Suspense>
      <SiteFooter />
    </main>
  )
}

