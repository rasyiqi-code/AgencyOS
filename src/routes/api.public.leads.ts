import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { createLead } from '@/lib/server/leads'
import { z } from 'zod'

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  source: z.string().max(100).optional(),
  path: z.string().max(255).optional(),
  locale: z.string().max(10).optional(),
})

export const Route = createFileRoute('/api/public/leads')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const validationResult = leadSchema.safeParse(body)

          if (!validationResult.success) {
            return json(
              { error: validationResult.error.issues[0].message },
              { status: 400 }
            )
          }

          const { firstName, email, source, path, locale } = validationResult.data

          const lead = await createLead({
            firstName,
            email,
            source: source || 'popup',
            path,
            locale
          })

          return json({ success: true, data: lead })
        } catch (error) {
          return json({ error: (error as Error).message }, { status: 500 })
        }
      }
    }
  }
})
