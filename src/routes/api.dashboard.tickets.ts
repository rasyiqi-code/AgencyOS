import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/dashboard/tickets')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')

        let user
        try {
          user = await hexclaveServerApp.getUser()
        } catch (error) {
          console.error('Stack Auth Error:', error)
          return json({ error: 'Authentication Service Error' }, { status: 401 })
        }

        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '50')
          const skip = (page - 1) * limit

          const tickets = await prisma.ticket.findMany({
            where: {
              userId: user.id,
              ...(type ? { type } : {})
            } as any,
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip,
            include: {
              messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
              }
            }
          })

          return json(tickets)
        } catch (error) {
          console.error('List Tickets Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
