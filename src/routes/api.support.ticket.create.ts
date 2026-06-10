import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { z } from 'zod'

const createTicketSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  initialMessage: z.string().min(1),
  type: z.enum(['chat', 'ticket']).default('ticket'),
})

export const Route = createFileRoute('/api/support/ticket/create')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()

        try {
          const body = createTicketSchema.parse(await request.json())

          if (!user && !body.email) {
            return json({ error: 'Email is required for guests' }, { status: 400 })
          }

          const ticket = await prisma.ticket.create({
            data: {
              userId: user?.id,
              email: body.email || user?.primaryEmail || null,
              name: body.name || user?.displayName || user?.primaryEmail?.split('@')[0] || 'Client',
              type: body.type,
              messages: {
                create: {
                  sender: 'user',
                  content: body.initialMessage
                }
              }
            } as any,
            include: {
              messages: true
            }
          })

          const { notifyNewSupportTicket } = await import('@/lib/email/admin-notifications')
          notifyNewSupportTicket({
            id: ticket.id,
            type: ticket.type as 'chat' | 'ticket',
            name: ticket.name || 'Client',
            email: ticket.email || 'No Email',
            message: body.initialMessage
          }).catch(err => console.error('Support notification error:', err))

          return json(ticket, { status: 201 })
        } catch (error: any) {
          if (error instanceof z.ZodError) {
            return json({ error: error.issues }, { status: 400 })
          }
          console.error('Create Ticket Error:', error)
          return json({ error: error.message || 'An unknown error occurred' }, { status: 500 })
        }
      }
    }
  }
})
