import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'

// Definisikan API Route '/api/system/seo/pages/$id'
export const Route = createFileRoute('/api/system/seo/pages/$id')({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        // Validasi hak akses admin
        const hasAccess = await isAdmin()
        if (!hasAccess) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const { id } = params
          if (!id) {
            return json({ error: 'ID is required' }, { status: 400 })
          }

          const page = await prisma.pageSeo.delete({
            where: { id },
          })

          return json({ success: true, path: page.path })
        } catch (error) {
          console.error('Delete SEO page error:', error)
          return json({ error: 'Failed to delete page configuration' }, { status: 500 })
        }
      },
    },
  },
})
