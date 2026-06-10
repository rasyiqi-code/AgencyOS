import { createFileRoute, Link } from '@tanstack/react-router'
import { getPublicProductsFn } from '@/src/server/products'
import { getPageSeo } from '@/lib/server/seo'
import { ProductCard } from '@/components/public/product-card'
import { Sparkles } from 'lucide-react'
import { useLocale, useTranslations } from '@/lib/i18n/hooks'

export const Route = createFileRoute('/products/')({
  loader: async () => {
    const products = await getPublicProductsFn()
    const pageSeo = await getPageSeo('/products')
    return { products, pageSeo }
  },
  head: ({ loaderData }) => {
    const pageSeo = loaderData?.pageSeo
    const title = pageSeo?.title || 'Digital Products'
    const description = pageSeo?.description || 'Premium templates, plugins, and tools.'
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
  component: ProductsPage,
})

function ProductsPage() {
  const { products } = Route.useLoaderData()
  const t = useTranslations('Products')
  const locale = useLocale()
  const isId = locale === 'id'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return (
    <section className="relative min-h-screen bg-black text-white selection:bg-brand-yellow/30 pb-20 pt-12">
      {/* Product ItemList JSON-LD Schema for AI/GEO */}
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": products.map((product: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": isId ? (product.name_id || product.name) : product.name,
                  "description": isId ? (product.description_id || product.description) : product.description,
                  "image": product.image || undefined,
                  "url": `${baseUrl}/products/${product.slug}`,
                  "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock",
                  },
                },
              })),
            }),
          }}
        />
      )}

      {/* Hero Section */}
      <div className="relative z-10 text-center pt-24 pb-12 px-4">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-brand-yellow transition-colors mb-6"
        >
          ← {t("back")}
        </Link>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-brand-yellow" />
          {t("title")}
        </h1>
        <p className="text-zinc-400 text-lg mt-4 max-w-2xl mx-auto whitespace-pre-line leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Product Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {products.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-lg">
            {t("empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
