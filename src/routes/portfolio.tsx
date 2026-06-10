import { createFileRoute, Link } from '@tanstack/react-router'
import { getPublicPortfoliosFn } from '@/src/server/portfolios'
import { getSystemSettings, getPageSeoFn } from '@/src/server/settings'
import { PortfolioGrid } from '@/components/public/portfolio-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, MessageCircle } from 'lucide-react'
import { ScrollAnimationWrapper } from '@/components/ui/scroll-animation-wrapper'
import { TextTypewriter } from '@/components/ui/text-typewriter'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import { useLocale, useTranslations } from '@/lib/i18n/hooks'

export const Route = createFileRoute('/portfolio')({
  loader: async () => {
    const portfolioRes = await getPublicPortfoliosFn()
    const settings = await getSystemSettings({ data: ['AGENCY_NAME', 'CONTACT_PHONE'] })
    const pageSeo = await getPageSeoFn({ data: '/portfolio' })

    const portfolios = portfolioRes.success ? portfolioRes.data : []
    const agencyName = settings.find(s => s.key === 'AGENCY_NAME')?.value || 'Agency OS'
    const contactPhone = settings.find(s => s.key === 'CONTACT_PHONE')?.value || '6285183131249'

    return { portfolios, agencyName, contactPhone, pageSeo }
  },
  head: ({ loaderData }) => {
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'Portfolio'
    const description = pageSeo?.description || 'Our premium showcase of high-performance web designs.'
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
  component: PortfolioPage,
})

function PortfolioPage() {
  const { portfolios, agencyName, contactPhone } = Route.useLoaderData()
  const t = useTranslations('Portfolio')
  const locale = useLocale()
  const isId = locale === 'id'

  const waLink = `https://wa.me/${contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    isId ? 'Halo, saya ingin minta contoh desain gratis.' : 'Hi, I would like to request a free design sample.'
  )}`
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden selection:bg-brand-yellow/30 pt-12">
      <BreadcrumbSchema
        items={[
          { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
          { name: 'Portfolio', item: `${baseUrl}/${locale}/portfolio` },
        ]}
      />

      {/* Portfolio List Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": t('titlePart1') + " " + t('titlePart2'),
            "description": t('description'),
            "itemListElement": portfolios.map((p: any, index: number) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `${baseUrl}/view-design/${p.slug}`,
              "name": p.title
            }))
          }),
        }}
      />

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-yellow/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-300/5 rounded-full blur-[150px] animate-pulse delay-700" />
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-brand-yellow/5 rounded-full blur-[180px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 pt-20">
        <ScrollAnimationWrapper>
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

            <Badge variant="outline" className="mb-6 bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 px-5 py-1.5 text-[10px] tracking-[0.1em] font-bold backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(254,215,0,0.05)] border-t-brand-yellow/40">
              {agencyName} {t('showcase')}
            </Badge>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
              <span className="text-brand-yellow drop-shadow-2xl">{t('titlePart1')}</span> <br />
              <TextTypewriter
                text={t('titlePart2')}
                className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500"
                speed={40}
                delay={500}
              />
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base lg:text-lg leading-relaxed font-light mb-8">
              {t('description')}
            </p>

            <div className="flex justify-center">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-brand-yellow hover:bg-brand-yellow/90 text-black font-black rounded-full px-8 h-12 text-sm shadow-[0_0_30px_rgba(254,215,0,0.2)] transition-all hover:scale-105 active:scale-95 border-2 border-black/10">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  {t('freeDesignSample')}
                </Button>
              </a>
            </div>
          </div>
        </ScrollAnimationWrapper>

        {portfolios.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-lg">
            No portfolios found.
          </div>
        ) : (
          <PortfolioGrid items={portfolios} />
        )}

        {/* CTA Section */}
        <ScrollAnimationWrapper>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-white/5 mt-12 max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight text-center md:text-left">
              {t('readyToScale')}
            </h2>

            <div className="flex items-center gap-4">
              <Link to="/price-calculator">
                <Button size="default" className="bg-brand-yellow hover:bg-brand-yellow/90 text-black font-black rounded-full px-6 h-10 text-sm shadow-xl shadow-brand-yellow/10 transition-all border-2 border-black/10">
                  {t('getQuote')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="default" variant="ghost" className="font-bold rounded-full text-zinc-400 hover:text-white hover:bg-white/5 px-6 h-10 text-sm border-2 border-white/20 hover:border-white/40 transition-all">
                  {t('instantSolution')}
                  <Zap className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </div>
  )
}
