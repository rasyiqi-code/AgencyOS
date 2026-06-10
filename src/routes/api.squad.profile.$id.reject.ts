import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { squadService } from '@/lib/server/squad'
import { isAdmin } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/api/squad/profile/$id/reject')({
  server: {
    handlers: {
      POST: async ({ params }: { params: { id: string } }) => {
        if (!await isAdmin()) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { id } = params
          await squadService.rejectProfile(id)
          return json({ success: true })
        } catch {
          return json(
            { success: false, error: 'Failed to reject profile' },
            { status: 500 }
          )
        }
      }
    }
  }
})
