import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { Prisma } from '@prisma/client'
import { hexclaveServerApp } from '@/lib/config/hexclave'

async function requireAdmin() {
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Unauthorized')
}

export const getAdminTicketsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      await requireAdmin()

      const rawTickets = await prisma.ticket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      // Format data agar serializable
      const allTickets = rawTickets.map(t => ({
        ...t,
        type: t.type,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
          attachments: m.attachments as Prisma.JsonValue
        }))
      }))

      const liveChatTickets = allTickets.filter(t => t.type === 'chat')
      const supportTickets = allTickets.filter(t => t.type === 'ticket')

      return {
        success: true,
        liveChatTickets: JSON.parse(JSON.stringify(liveChatTickets)),
        supportTickets: JSON.parse(JSON.stringify(supportTickets))
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, liveChatTickets: [], supportTickets: [] }
    }
  })

export const getSupportTickets = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const user = await hexclaveServerApp.getUser()
      if (!user) throw new Error('Unauthorized')
      const locale = getCookie('APP_LOCALE') || 'en'

      const rawTickets = await prisma.ticket.findMany({
        where: { userId: user.id, type: 'ticket' },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      const tickets = rawTickets.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        messages: t.messages.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString()
        }))
      }))

      return {
        success: true,
        locale,
        tickets: JSON.parse(JSON.stringify(tickets))
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, locale: 'en', tickets: [] }
    }
  })

