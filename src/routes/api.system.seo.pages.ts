import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'

// Definisikan API Route '/api/system/seo/pages'
export const Route = createFileRoute('/api/system/seo/pages')({
  server: {
    handlers: {
      GET: async () => {
        // Validasi hak akses admin
        const hasAccess = await isAdmin()
        if (!hasAccess) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const pages = await prisma.pageSeo.findMany({
            orderBy: { path: 'asc' },
          })
          return json(pages)
        } catch (error) {
          console.error('Fetch SEO pages error:', error)
          return json({ error: 'Failed to fetch pages' }, { status: 500 })
        }
      },
      POST: async ({ request }) => {
        // Validasi hak akses admin
        const hasAccess = await isAdmin()
        if (!hasAccess) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const body = await request.json()
          const {
            path,
            title,
            title_id,
            description,
            description_id,
            keywords,
            keywords_id,
            ogImage,
          } = body

          if (!path) {
            return json({ error: 'Path is required' }, { status: 400 })
          }

          // Pastikan path diawali dengan '/'
          const normalizedPath = path.startsWith('/') ? path : `/${path}`

          const page = await prisma.pageSeo.upsert({
            where: {
              path: normalizedPath,
            },
            create: {
              path: normalizedPath,
              title: title || null,
              title_id: title_id || null,
              description: description || null,
              description_id: description_id || null,
              keywords: keywords || null,
              keywords_id: keywords_id || null,
              ogImage: ogImage || null,
            },
            update: {
              title: title || null,
              title_id: title_id || null,
              description: description || null,
              description_id: description_id || null,
              keywords: keywords || null,
              keywords_id: keywords_id || null,
              ogImage: ogImage || null,
            },
          })

          return json(page)
        } catch (error) {
          console.error('Page SEO upsert error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      },
    },
  },
})
