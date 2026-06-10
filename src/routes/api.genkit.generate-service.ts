import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { serviceGeneratorFlow } from '@/src/genkit/flows/service-generator'
import { isAdmin } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/api/genkit/generate-service')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          if (!await isAdmin()) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const { description } = await request.json()
          if (!description) {
            return json({ error: 'Description is required' }, { status: 400 })
          }

          const result = await serviceGeneratorFlow(description)
          return json({ success: true, data: result })
        } catch (error) {
          console.error('Service Generation Error:', error)
          return json({ success: false, error: 'Failed to generate service content' }, { status: 500 })
        }
      }
    }
  }
})
