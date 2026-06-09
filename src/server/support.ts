import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'
import type { Prisma } from '@prisma/client'

type TicketWithMessages = Prisma.TicketGetPayload<{
  include: { messages: { take: 1; orderBy: { createdAt: 'desc' } } }
}>

export const getSupportTickets = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const cookieLocale = getCookie('NEXT_LOCALE')
    const locale = cookieLocale?.slice(0, 2) === 'id' ? 'id' : 'en'

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id, type: 'ticket' } as Prisma.TicketWhereInput,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    }) as TicketWithMessages[]

    return {
      locale,
      tickets: tickets.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
    }
  },
)
