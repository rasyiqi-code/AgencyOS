import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { consultantFlow } from '@/src/genkit/flows/consultant'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const { messages } = await request.json()
          if (!messages || !Array.isArray(messages)) {
            return json({ error: 'Messages array is required' }, { status: 400 })
          }

          const response = await consultantFlow.stream({ messages })

          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder()
              try {
                if (!response.stream) {
                  throw new Error('No stream returned from Genkit')
                }

                for await (const chunk of response.stream) {
                  if (typeof chunk === 'string') {
                    controller.enqueue(encoder.encode(chunk))
                  } else if (chunk && typeof chunk === 'object') {
                    const chunkObj = chunk as Record<string, unknown>
                    const text = (chunkObj.text as string) || (chunkObj.content as string) || JSON.stringify(chunk)
                    controller.enqueue(encoder.encode(text))
                  }
                }
              } catch (error) {
                console.error('Genkit Stream Iteration Error:', error)
                const errorMsg = `\n\n[Chat Error: ${(error as Error).message}]`
                controller.enqueue(encoder.encode(errorMsg))
              } finally {
                controller.close()
              }
            }
          })

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            }
          })
        } catch (e) {
          console.error('Chat API POST Error:', e)
          return json({ error: (e as Error).message }, { status: 500 })
        }
      }
    }
  }
})
