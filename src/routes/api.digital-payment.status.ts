import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { getCore } from '@/lib/integrations/midtrans'
import { completeDigitalOrder } from '@/src/server/digital-orders'
import type { MidtransPaymentMetadata } from '@/types/payment'

export const Route = createFileRoute('/api/digital-payment/status')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const url = new URL(request.url)
          const orderId = url.searchParams.get('orderId')

          if (!orderId) {
            return json({ error: 'Order ID is required' }, { status: 400 })
          }

          const order = await prisma.digitalOrder.findFirst({
            where: {
              id: orderId,
              userId: user.id
            },
            select: {
              status: true,
              paymentId: true,
              paymentType: true
            }
          })

          if (!order) {
            return json({ error: 'Order not found' }, { status: 404 })
          }

          let currentStatus = order.status

          if (currentStatus !== 'PAID' && currentStatus !== 'settled' && order.paymentId) {
            try {
              if (order.paymentType === 'creem') {
                const { creem: getCreem } = await import('@/lib/integrations/creem')
                const creem = await getCreem()
                const creemStatus = await creem.checkouts.get({ checkoutId: order.paymentId })

                if (creemStatus.status === 'completed' || creemStatus.status === 'paid') {
                  const result = await completeDigitalOrder(orderId, order.paymentId, 'creem')
                  if (result.success) {
                    currentStatus = 'PAID'
                  }
                } else if (['canceled', 'expired'].includes(creemStatus.status)) {
                  currentStatus = creemStatus.status.toUpperCase()
                  await prisma.digitalOrder.update({
                    where: { id: orderId },
                    data: { status: currentStatus }
                  })
                }
              } else {
                const core = await getCore()
                const midtransStatus = await core.transaction.status(order.paymentId)
                const transactionStatus = midtransStatus.transaction_status

                if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
                  const transId = (midtransStatus as MidtransPaymentMetadata).transaction_id || order.paymentId
                  const result = await completeDigitalOrder(orderId, transId, midtransStatus.payment_type)
                  if (result.success) {
                    currentStatus = 'PAID'
                  }
                } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
                  currentStatus = transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED'
                  await prisma.digitalOrder.update({
                    where: { id: orderId },
                    data: { status: currentStatus }
                  })
                }
              }
            } catch (providerError) {
              console.error('[DIGITAL_STATUS_CHECK] Upstream check failed:', providerError)
            }
          }

          const mode = url.searchParams.get('mode')
          if (mode === 'json') {
            return json({ status: currentStatus })
          }

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`
          const redirectUrl = currentStatus === 'PAID'
            ? `${appUrl}/digital-invoices/${orderId}?status=success`
            : `${appUrl}/digital-invoices/${orderId}?status=pending`

          return Response.redirect(redirectUrl, 302)
        } catch (error) {
          console.error('Error fetching order status:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
