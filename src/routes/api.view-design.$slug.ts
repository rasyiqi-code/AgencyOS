import { createFileRoute } from '@tanstack/react-router'
import { getPortfolioHtml } from '@/lib/portfolios/actions'

export const Route = createFileRoute('/api/view-design/$slug')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { slug: string } }) => {
        const { slug } = params
        const html = await getPortfolioHtml(slug)

        if (html === '<h1>File not found</h1>') {
          return new Response('Not Found', { status: 404 })
        }

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        })
      }
    }
  }
})
