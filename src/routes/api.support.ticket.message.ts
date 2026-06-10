import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/support/ticket/message')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()

        try {
          const formData = await request.formData()
          const ticketId = formData.get('ticketId') as string
          const content = formData.get('content') as string
          const sender = formData.get('sender') as string
          const file = formData.get('file') as File | null

          if (!ticketId || (!content && !file)) {
            return json({ error: 'Missing required fields' }, { status: 400 })
          }

          if (sender === 'admin' && !user) {
            return json({ error: 'Unauthorized - Admin must be logged in' }, { status: 401 })
          }

          const attachments: any[] = []
          if (file && file.size > 0 && file.name !== 'undefined') {
            const { uploadFile } = await import('@/lib/integrations/storage')
            const url = await uploadFile(file, `tickets/${ticketId}/${Date.now()}-${file.name}`)
            attachments.push({
              name: file.name,
              url,
              type: file.type
            })
          }

          const message = await prisma.supportMessage.create({
            data: {
              ticketId,
              content: content || '',
              sender: sender || 'user',
              attachments: attachments.length > 0 ? attachments : undefined
            }
          })

          await prisma.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
          })

          return json(message, { status: 201 })
        } catch (error) {
          console.error('Send Message Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
