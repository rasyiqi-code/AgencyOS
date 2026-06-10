import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getActiveTestimonials } from '@/lib/server/testimonials'

export const Route = createFileRoute('/api/testimonials')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url)
          const active = url.searchParams.get('active')
          const onlyActive = active === 'true'

          const testimonials = onlyActive
            ? await getActiveTestimonials()
            : await prisma.testimonial.findMany({
                orderBy: { createdAt: 'desc' }
              })

          const headers: Record<string, string> = {}
          if (onlyActive) {
            headers['Cache-Control'] = 'public, max-age=3600'
          }

          return new Response(JSON.stringify({ success: true, data: testimonials }), {
            headers: {
              'Content-Type': 'application/json',
              ...headers
            }
          })
        } catch {
          return json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 })
        }
      }
    }
  }
})
