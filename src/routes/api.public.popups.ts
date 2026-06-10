import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getActivePopUps } from '@/lib/server/popups'

export const Route = createFileRoute('/api/public/popups')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const popups = await getActivePopUps()
          return json(popups, {
            headers: {
              'Cache-Control': 'public, max-age=3600'
            }
          })
        } catch (error) {
          return json({ error: (error as Error).message }, { status: 500 })
        }
      }
    }
  }
})
