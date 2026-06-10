import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { sendInvoiceEmail } from '@/lib/email/client-notifications'
import { type ScreenItem, type ApiItem } from '@/lib/shared/types'
import { broadcastPushNotification } from '@/lib/server/push'

export const Route = createFileRoute('/api/invoices/send')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (!await isAdmin()) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { estimateId } = await request.json()
          if (!estimateId) {
            return json({ error: 'estimateId is required' }, { status: 400 })
          }

          const estimate = await prisma.estimate.findUnique({
            where: { id: estimateId },
            include: {
              service: true,
              project: true
            }
          })

          if (!estimate) {
            return json({ error: 'Estimate not found' }, { status: 404 })
          }

          const userId = estimate.project?.userId || estimate.userId
          if (!userId) {
            return json({ error: 'No associated user found for this estimate' }, { status: 400 })
          }

          const stackUser = await hexclaveServerApp.getUser(userId)
          if (!stackUser?.primaryEmail) {
            return json({ error: 'User email not found' }, { status: 400 })
          }

          const customerName = stackUser.displayName ||
            estimate.project?.clientName ||
            stackUser.primaryEmail.split('@')[0] ||
            'Client'

          const currency = estimate.service?.currency || 'USD'
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const paymentLink = estimate.project
            ? `${appUrl}/dashboard/quotes`
            : undefined

          const result = await sendInvoiceEmail({
            to: stackUser.primaryEmail,
            customerName,
            invoiceId: `#${estimateId.slice(-8).toUpperCase()}`,
            serviceName: estimate.service?.title || estimate.title || 'Service',
            amount: estimate.totalCost,
            currency,
            paymentLink,
            screens: (estimate.screens || []) as ScreenItem[],
            apis: (estimate.apis || []) as ApiItem[]
          })

          if (!result.success) {
            return json({ error: result.error || 'Failed to send email' }, { status: 500 })
          }

          // Kirim push notifikasi follow-up
          const subscriptions = await prisma.pushSubscription.findMany()
          if (subscriptions.length > 0) {
            const pushSubs = subscriptions.map((s) => ({
              endpoint: s.endpoint,
              keys: {
                p256dh: s.p256dh,
                auth: s.auth
              }
            }))
            await broadcastPushNotification(pushSubs, {
              title: 'Invoice Baru Terbit! 📄',
              body: `Invoice #${estimateId.slice(-8).toUpperCase()} untuk ${estimate.service?.title || 'layanan kami'} telah dikirim ke email Anda.`,
              url: paymentLink || `${appUrl}/products`
            }).catch(err => console.error('Auto Push Invoice Error:', err))
          }

          return json({ success: true, message: `Invoice sent to ${stackUser.primaryEmail}` })
        } catch (error) {
          console.error('Send Invoice Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
