import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/api/support/ticket/$id')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { id: string } }) => {
        const { id } = params
        try {
          const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' }
              }
            }
          })

          if (!ticket) {
            return json({ error: 'Ticket not found' }, { status: 404 })
          }

          return json(ticket)
        } catch (error) {
          console.error('Fetch Ticket Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
