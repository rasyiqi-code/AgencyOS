import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { createSubscriber } from '@/lib/server/marketing'

export const Route = createFileRoute('/api/marketing/subscribe')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { email, name } = await request.json()
          if (!email) {
            return json({ error: 'Email is required' }, { status: 400 })
          }

          await createSubscriber(email, name)
          return json({ success: true })
        } catch (error) {
          console.error('Subscription API error:', error)
          return json({ error: (error as Error).message }, { status: 500 })
        }
      }
    }
  }
})
