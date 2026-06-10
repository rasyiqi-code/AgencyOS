import { createFileRoute } from '@tanstack/react-router'
import { getPublicServicesFn } from '@/src/server/services'
import { getPageSeo } from '@/lib/server/seo'
import { ServicesClientWrapper } from '@/components/public/services-client-wrapper'
import { SectionCustomRequest } from '@/components/landing/section-custom-request'
import { Testimonials } from '@/components/landing/section-testimonials'
import { SectionGuarantee } from '@/components/landing/section-guarantee'
import { FAQSection } from '@/components/landing/faq-section-fixed'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import { useLocale } from '@/lib/i18n/hooks'

export const Route = createFileRoute('/services/')({
  loader: async () => {
    const services = await getPublicServicesFn()
    const pageSeo = await getPageSeo('/services')
    return { services, pageSeo }
  },
  head: ({ loaderData }) => {
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'Services'
    const description = pageSeo?.description || 'Explore our premium productized services.'
    const ogImage = pageSeo?.ogImage || undefined
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
      ]
    }
  },
  component: PublicServicesPage,
})

function PublicServicesPage() {
  const { services } = Route.useLoaderData()
  const locale = useLocale()
  const isId = locale === 'id'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return (
    <div className="flex flex-col bg-black text-white pt-12 pb-24 selection:bg-brand-yellow/30">
      <BreadcrumbSchema
        items={[
          { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
          { name: isId ? 'Layanan' : 'Services', item: `${baseUrl}/${locale}/services` },
        ]}
      />
      
      {/* ProfessionalService JSON-LD Schema for AI/GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": services.map((s: any, index: number) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Service",
                "name": isId ? (s.title_id || s.title) : s.title,
                "description": isId ? (s.description_id || s.description) : s.description,
                "offers": {
                  "@type": "Offer",
                  "price": s.price,
                  "priceCurrency": s.currency,
                },
                "url": `${baseUrl}/services${s.slug ? `#${s.slug}` : ""}`,
              },
            })),
          }),
        }}
      />

      <div className="pt-16">
        <ServicesClientWrapper services={services} />
      </div>
      <SectionCustomRequest />
      <Testimonials />
      <SectionGuarantee />
      <FAQSection />
    </div>
  )
}
