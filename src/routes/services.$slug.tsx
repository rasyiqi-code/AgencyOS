import { createFileRoute, notFound } from '@tanstack/react-router'
import { getPublicServiceBySlugFn } from '@/src/server/services'
import { ServiceDetailContent } from '@/components/public/service-detail'
import { Testimonials } from '@/components/landing/section-testimonials'
import { SectionGuarantee } from '@/components/landing/section-guarantee'
import { FAQSection } from '@/components/landing/faq-section-fixed'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import { useLocale } from '@/lib/i18n/hooks'

export const Route = createFileRoute('/services/$slug')({
  loader: async ({ params }) => {
    const service = await getPublicServiceBySlugFn({ data: params.slug })
    if (!service) {
      throw notFound()
    }
    return { service }
  },
  head: ({ loaderData }) => {
    const service = loaderData?.service
    if (!service) return { title: 'Service Not Found' }
    const title = service.title
    const description = (service.description || '').replace(/<[^>]*>?/gm, '').slice(0, 160)
    const ogImage = service.image || undefined
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
  component: PublicServiceDetailPage,
})

function PublicServiceDetailPage() {
  const { service } = Route.useLoaderData()
  const locale = useLocale()
  const isId = locale === 'id'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  const title = isId ? (service.title_id || service.title) : service.title
  const description = isId ? (service.description_id || service.description || "") : (service.description || "")
  const cleanDescription = description.replace(/<[^>]*>?/gm, '').slice(0, 160)

  return (
    <div className="flex flex-col bg-black text-white pt-12 pb-24 selection:bg-brand-yellow/30">
      <BreadcrumbSchema
        items={[
          { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
          { name: isId ? 'Layanan' : 'Services', item: `${baseUrl}/${locale}/services` },
          { name: title, item: `${baseUrl}/${locale}/services/${service.slug}` },
        ]}
      />
      {/* Service Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": title,
            "provider": {
              "@type": "Organization",
              "name": "Crediblemark",
              "url": baseUrl
            },
            "description": cleanDescription,
            "areaServed": "Worldwide",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": title,
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": title
                  },
                  "price": service.price,
                  "priceCurrency": "USD"
                }
              ]
            }
          })
        }}
      />
      <div className="pt-16">
        <ServiceDetailContent
          service={service}
          isId={isId}
          trustedAvatars={[]}
        />
      </div>
      <Testimonials />
      <SectionGuarantee />
      <FAQSection />
    </div>
  )
}
