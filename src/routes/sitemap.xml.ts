import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/sitemap/xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const urlObj = new URL(request.url)
        const host = request.headers.get('host') || urlObj.host
        const protocol = request.headers.get('x-forwarded-proto') || urlObj.protocol.replace(':', '') || 'https'
        
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
        baseUrl = baseUrl.replace(/\/$/, '')

        const locales = ['id', 'en']
        const now = new Date()

        let portfolios: any[] = []
        let products: any[] = []
        let services: any[] = []

        try {
          const [portfoliosRes, productsRes, servicesRes] = await Promise.all([
            prisma.portfolio.findMany({
              orderBy: { createdAt: 'desc' },
              select: { slug: true, createdAt: true }
            }).catch(() => []),
            prisma.product.findMany({
              where: { isActive: true },
              orderBy: { updatedAt: 'desc' },
              select: { slug: true, createdAt: true, updatedAt: true }
            }).catch(() => []),
            prisma.service.findMany({
              where: { isActive: true },
              orderBy: { updatedAt: 'desc' },
              select: { slug: true, createdAt: true, updatedAt: true }
            }).catch(() => [])
          ])
          portfolios = portfoliosRes
          products = productsRes
          services = servicesRes
        } catch (err) {
          console.error('[Sitemap] Error fetching data:', err)
        }

        const staticPaths = [
          '',
          '/services',
          '/portfolio',
          '/products',
          '/contact',
          '/experts',
          '/price-calculator',
          '/submit-testimonial',
          '/promosi',
          '/docs',
          '/privacy',
          '/terms',
        ]

        const baseRoutes: any[] = []

        for (const route of staticPaths) {
          baseRoutes.push({
            route,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
          })
        }

        for (const portfolio of portfolios) {
          if (portfolio?.slug) {
            baseRoutes.push({
              route: `/view-design/${portfolio.slug}`,
              lastModified: portfolio.createdAt || now,
              changeFrequency: 'monthly',
              priority: 0.7,
            })
          }
        }

        for (const product of products) {
          if (product?.slug) {
            baseRoutes.push({
              route: `/products/${product.slug}`,
              lastModified: product.updatedAt || product.createdAt || now,
              changeFrequency: 'weekly',
              priority: 0.9,
            })
          }
        }

        for (const service of services) {
          if (service?.slug) {
            baseRoutes.push({
              route: `/services/${service.slug}`,
              lastModified: service.updatedAt || service.createdAt || now,
              changeFrequency: 'weekly',
              priority: 0.8,
            })
          }
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

        for (const locale of locales) {
          const prefix = `${baseUrl}/${locale}`
          for (const baseRoute of baseRoutes) {
            const url = `${prefix}${baseRoute.route}`
            
            let lastmod = now.toISOString()
            try {
              if (baseRoute.lastModified) {
                const dateObj = new Date(baseRoute.lastModified)
                if (!isNaN(dateObj.getTime())) {
                  lastmod = dateObj.toISOString()
                }
              }
            } catch {
              // ignore and use now
            }
            
            xml += `  <url>\n`
            xml += `    <loc>${url}</loc>\n`
            xml += `    <lastmod>${lastmod}</lastmod>\n`
            xml += `    <changefreq>${baseRoute.changeFrequency}</changefreq>\n`
            xml += `    <priority>${baseRoute.priority}</priority>\n`
            
            for (const altLocale of locales) {
              const altUrl = `${baseUrl}/${altLocale}${baseRoute.route}`
              xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}"/>\n`
            }
            
            xml += `  </url>\n`
          }
        }

        xml += '</urlset>'

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
          },
        })
      }
    }
  }
})
