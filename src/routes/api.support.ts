import { createFileRoute } from '@tanstack/react-router'
import { supportFlow } from '@/src/genkit'
import { toReadableStream } from '@/lib/config/genkit-stream'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/support')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = await request.json()
          const typedMessages = (messages || []) as any[]

          let normalizedMessages = typedMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content || m.parts?.map((p: any) => p.text).join('\n') || ''
          }))

          const firstUserIndex = normalizedMessages.findIndex((m) => m.role === 'user')

          if (firstUserIndex !== -1) {
            normalizedMessages = normalizedMessages.slice(firstUserIndex)
          } else {
            normalizedMessages = []
          }

          const response = await supportFlow.stream({ messages: normalizedMessages })

          return new Response(toReadableStream(response), {
            headers: {
              'Content-Type': 'text/event-stream'
            }
          })
        } catch (error) {
          console.error('Support Flow API Error:', error)
          return json({ error: (error as Error).message }, { status: 500 })
        }
      }
    }
  }
})
