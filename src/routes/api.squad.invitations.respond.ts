import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { squadService } from '@/lib/server/squad'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/squad/invitations/respond')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { applicationId, accept } = await request.json()
          await squadService.respondToInvitation(applicationId, accept)
          return json({ success: true })
        } catch (error) {
          console.error('Invitation response error:', error)
          return json({ error: 'Internal Error' }, { status: 500 })
        }
      }
    }
  }
})
