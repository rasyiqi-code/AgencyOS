import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/api/push/subscribe')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { subscription, metadata } = await request.json()

          if (!subscription || !subscription.endpoint) {
            return json({ error: 'Invalid subscription data' }, { status: 400 })
          }

          const p256dh = subscription.keys?.p256dh
          const auth = subscription.keys?.auth

          if (!p256dh || !auth) {
            return json({ error: 'Missing encryption keys' }, { status: 400 })
          }

          const savedSubscription = await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
              p256dh,
              auth,
              metadata: metadata || {},
              updatedAt: new Date()
            },
            create: {
              endpoint: subscription.endpoint,
              p256dh,
              auth,
              metadata: metadata || {}
            }
          })

          return json({ success: true, id: savedSubscription.id })
        } catch (error) {
          console.error('Push Subscribe Error:', error)
          return json({ error: 'Failed to subscribe to push notifications' }, { status: 500 })
        }
      },
      DELETE: async ({ request }: { request: Request }) => {
        try {
          const { endpoint } = await request.json()

          if (!endpoint) {
            return json({ error: 'Endpoint required' }, { status: 400 })
          }

          await prisma.pushSubscription.deleteMany({
            where: { endpoint }
          })

          return json({ success: true })
        } catch (error) {
          console.error('Push Unsubscribe Error:', error)
          return json({ error: 'Failed to unsubscribe' }, { status: 500 })
        }
      }
    }
  }
})
