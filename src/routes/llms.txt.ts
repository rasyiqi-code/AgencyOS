import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { getSystemSettings } from '@/src/server/settings'
import { type SystemSetting } from '@prisma/client'

export const Route = createFileRoute('/llms/txt')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const urlObj = new URL(request.url)
        const host = request.headers.get('host') || urlObj.host
        const protocol = request.headers.get('x-forwarded-proto') || urlObj.protocol.replace(':', '') || 'https'
        
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
        baseUrl = baseUrl.replace(/\/$/, '')

        const settings = await getSystemSettings({
          data: [
            'AGENCY_NAME',
            'SEO_DESCRIPTION',
            'SEO_DESCRIPTION_ID',
            'CONTACT_PHONE',
            'CONTACT_EMAIL',
          ]
        })

        const getSetting = (key: string) => settings?.find((s: SystemSetting) => s.key === key)?.value

        const agencyName = getSetting('AGENCY_NAME') || 'Agency OS'
        const description = getSetting('SEO_DESCRIPTION') || 'Professional Software Development Agency'
        const phone = getSetting('CONTACT_PHONE') || ''
        const email = getSetting('CONTACT_EMAIL') || ''

        const services = await prisma.service.findMany({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
          select: { title: true, slug: true, description: true, price: true, currency: true },
        })

        const products = await prisma.product.findMany({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
          select: { name: true, slug: true, description: true, price: true, currency: true, type: true },
        })

        const lines: string[] = [
          `# ${agencyName}`,
          '',
          `> ${description}`,
          '',
          '## About',
          '',
          `${agencyName} is a professional software development agency that combines AI-powered development with senior human expert oversight. We deliver premium websites, web applications, mobile apps, and digital products with transparent pricing and rapid delivery.`,
          '',
        ]

        if (phone || email) {
          lines.push('## Contact')
          lines.push('')
          if (phone) lines.push(`- Phone: ${phone}`)
          if (email) lines.push(`- Email: ${email}`)
          lines.push(`- Website: ${baseUrl}`)
          lines.push('')
        }

        lines.push('## Pages')
        lines.push('')
        lines.push(`- [Home](${baseUrl}/): Main landing page with agency overview, workflow, and testimonials`)
        lines.push(`- [Services](${baseUrl}/services): Our productized services with transparent pricing`)
        lines.push(`- [Products](${baseUrl}/products): Digital products, templates, and plugins`)
        lines.push(`- [Portfolio](${baseUrl}/portfolio): Showcase of completed projects and designs`)
        lines.push(`- [Experts](${baseUrl}/experts): Meet our team of senior engineers and vetted experts`)
        lines.push(`- [Price Calculator](${baseUrl}/price-calculator): AI-powered instant project cost estimator`)
        lines.push(`- [Contact](${baseUrl}/contact): Get in touch with our team`)
        lines.push('')

        if (services.length > 0) {
          lines.push('## Services')
          lines.push('')
          for (const service of services) {
            const serviceUrl = service.slug
              ? `${baseUrl}/services#${service.slug}`
              : `${baseUrl}/services`
            const priceStr = `${service.currency} ${service.price.toLocaleString()}`
            lines.push(
              `- [${service.title}](${serviceUrl}): ${service.description.substring(0, 150)}${service.description.length > 150 ? '...' : ''} (${priceStr})`
            )
          }
          lines.push('')
        }

        if (products.length > 0) {
          lines.push('## Digital Products')
          lines.push('')
          for (const product of products) {
            const productUrl = `${baseUrl}/products/${product.slug}`
            const desc = product.description
              ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '')
              : 'Digital product'
            const priceStr = product.price > 0
              ? ` (${product.currency} ${product.price.toLocaleString()})`
              : ' (Free)'
            lines.push(
              `- [${product.name}](${productUrl}): ${desc}${priceStr}`
            )
          }
          lines.push('')
        }

        lines.push('## Technical Details')
        lines.push('')
        lines.push(`- Sitemap: ${baseUrl}/sitemap.xml`)
        lines.push(`- Robots: ${baseUrl}/robots.txt`)
        lines.push('')

        const content = lines.join('\n')

        return new Response(content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        })
      }
    }
  }
})
