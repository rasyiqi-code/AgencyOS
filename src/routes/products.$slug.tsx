import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { getPublicProductBySlugFn, getPublicProductsFn } from '@/src/server/products'
import { getPublicServicesFn } from '@/src/server/services'
import { Sparkles, Package, ShieldCheck, Download, Zap, HeartHandshake, LifeBuoy } from 'lucide-react'
import { PriceDisplay } from '@/components/providers/currency-provider'
import { ProductRecommendations } from '@/components/public/product-recommendations'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import { useLocale, useTranslations } from '@/lib/i18n/hooks'

export const Route = createFileRoute('/products/$slug')({
  loader: async ({ params }) => {
    const product = await getPublicProductBySlugFn({ data: params.slug })
    if (!product) {
      throw notFound()
    }
    const allProducts = await getPublicProductsFn()
    const services = await getPublicServicesFn()

    return { product, allProducts, services }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product
    if (!product) return { title: 'Product Not Found' }
    const title = product.name
    const description = (product.description || '').slice(0, 160)
    const ogImage = product.image || undefined
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
  component: PublicProductDetailPage,
})

function PublicProductDetailPage() {
  const { product, allProducts, services } = Route.useLoaderData()
  const t = useTranslations('ProductDetail')
  const locale = useLocale()
  const isId = locale === 'id'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  const name = isId ? (product.name_id || product.name) : product.name
  const description = isId ? (product.description_id || product.description) : product.description

  const recommendedProducts = allProducts.filter((p: any) => p.id !== product.id)
  const crossSellServices = services.slice(0, 3)

  const purchaseLabel = product.purchaseType === "subscription"
    ? (product.interval === "month" ? t("monthly") : product.interval || t("monthly"))
    : t("oneTime")

  return (
    <div className="bg-black text-white selection:bg-brand-yellow/30 pt-12">
      <BreadcrumbSchema
        items={[
          { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
          { name: isId ? 'Produk' : 'Products', item: `${baseUrl}/${locale}/products` },
          { name: name, item: `${baseUrl}/${locale}/products/${product.slug}` },
        ]}
      />

      <section className="relative min-h-screen">
        {/* Individual Product JSON-LD Schema for AI/GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": name,
              "description": description || undefined,
              "image": product.image || undefined,
              "url": `${baseUrl}/products/${product.slug}`,
              "category": product.type,
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": product.currency || "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
              },
            }),
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
            
            {/* Kolom Kiri: Info Produk */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                </div>

                <div className="p-5 lg:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                      {purchaseLabel}
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {product.type}
                    </div>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
                    {name}
                  </h1>

                  {description && (
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 whitespace-pre-line">
                      {description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <Download className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                      <span className="text-[11px] text-zinc-400">{t("instantDownload")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                      <span className="text-[11px] text-zinc-400">{t("licenseIncluded")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <Package className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                      <span className="text-[11px] text-zinc-400">{t("fullSourceCode")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kenapa Memilih Kami */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 mt-5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t("whyChooseUs")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-brand-yellow/10 shrink-0">
                      <Zap className="w-3.5 h-3.5 text-brand-yellow" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{t("instantAccess")}</div>
                      <div className="text-[11px] text-zinc-500 mt-1">{t("instantAccessDesc")}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-brand-yellow/10 shrink-0">
                      <LifeBuoy className="w-3.5 h-3.5 text-brand-yellow" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{t("prioritySupport")}</div>
                      <div className="text-[11px] text-zinc-500 mt-1">{t("prioritySupportDesc")}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-brand-yellow/10 shrink-0">
                      <HeartHandshake className="w-3.5 h-3.5 text-brand-yellow" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{t("satisfaction")}</div>
                      <div className="text-[11px] text-zinc-500 mt-1">{t("satisfactionDesc")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Sidebar Pembelian */}
            <div className="lg:col-span-1 space-y-5">
              <div className="lg:sticky lg:top-24 space-y-5">
                
                {/* Price + CTA Card */}
                <div className="hidden lg:block rounded-2xl border border-brand-yellow/20 bg-zinc-900/60 backdrop-blur-xl p-5 shadow-xl">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{t("price")}</div>
                  <div className="text-3xl font-black text-white tracking-tighter mb-1">
                    <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                    {product.purchaseType === "subscription" && (
                      <span className="text-sm font-normal text-zinc-500 ml-1">/{product.interval === 'month' ? t("monthly") : product.interval}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 mb-5">
                    {product.purchaseType === "subscription" ? t("subscriptionNotice") : t("oneTimeNotice")}
                  </p>
                  <a
                    href={`/checkout/${product.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-12 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-brand-yellow/20 transition-colors"
                  >
                    {t("buyNow")}
                  </a>
                </div>

                {/* Cross-sell Services */}
                {crossSellServices.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t("needCustom")}</h3>
                    <div className="space-y-3">
                      {crossSellServices.map((service: any) => (
                        <Link
                          key={service.id}
                          to="/services"
                          className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand-yellow/20 transition-colors"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800/50 shrink-0 flex items-center justify-center">
                            {service.image ? (
                              <img src={service.image} alt={service.title} className="object-cover w-full h-full" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-zinc-700" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white group-hover:text-brand-yellow transition-colors truncate">
                              {isId ? (service.title_id || service.title) : service.title}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              From <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Rekomendasi Produk Lain */}
          <ProductRecommendations
            products={recommendedProducts}
            title={t("youMightLike")}
            subtitle={t("exploreMore")}
          />
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 lg:hidden z-[100]">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{t("price")}</div>
              <div className="text-xl font-black text-white tracking-tighter flex items-end gap-1">
                <PriceDisplay amount={product.price} baseCurrency="USD" compact />
                {product.purchaseType === "subscription" && (
                  <span className="text-xs font-normal text-zinc-500 pb-0.5">/{product.interval === 'month' ? t("monthly") : product.interval}</span>
                )}
              </div>
            </div>
            <a
              href={`/checkout/${product.id}`}
              className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-11 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-brand-yellow/20 transition-colors"
            >
              {t("buyNow")}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
