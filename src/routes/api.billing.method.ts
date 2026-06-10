import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/billing/method')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const { orderId, paymentType, metadata } = await request.json()
          if (!orderId) {
            return json({ error: 'Missing order ID' }, { status: 400 })
          }

          // Cek Order Jasa
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentMetadata: true, project: { select: { userId: true } } }
          })

          if (order) {
            if (order.project?.userId !== user.id) {
              return json({ error: 'Forbidden' }, { status: 403 })
            }

            const currentMeta = (order.paymentMetadata as object) || {}

            await prisma.order.update({
              where: { id: orderId },
              data: {
                paymentType,
                paymentMetadata: {
                  ...currentMeta,
                  ...metadata
                } as any
              }
            })

            return json({ success: true })
          }

          // Cek DigitalOrder
          const digitalOrder = await prisma.digitalOrder.findUnique({
            where: { id: orderId }
          })

          if (digitalOrder) {
            if (digitalOrder.userId !== user.id) {
              return json({ error: 'Forbidden' }, { status: 403 })
            }

            const currentMeta = (digitalOrder.paymentMetadata as object) || {}

            await prisma.digitalOrder.update({
              where: { id: orderId },
              data: {
                paymentType,
                paymentMetadata: {
                  ...currentMeta,
                  ...metadata
                } as any
              }
            })

            return json({ success: true })
          }

          return json({ error: 'Order not found' }, { status: 404 })
        } catch (error) {
          console.error('Select Payment Method Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
