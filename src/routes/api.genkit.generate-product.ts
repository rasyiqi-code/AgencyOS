import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { productGeneratorFlow } from '@/src/genkit/flows/product-generator'
import { isAdmin } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/api/genkit/generate-product')({
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

          const result = await productGeneratorFlow(description)
          return json({ success: true, data: result })
        } catch (error) {
          console.error('Product Generation Error:', error)
          return json({ success: false, error: 'Failed to generate product draft' }, { status: 500 })
        }
      }
    }
  }
})
