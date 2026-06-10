import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCore } from '@/lib/integrations/midtrans'
import { creem as getCreem } from '@/lib/integrations/creem'
import { processAffiliateCommission } from '@/lib/affiliate/commission'
import type { CreemPaymentMetadata } from '@/types/payment'
import { getAppUrl } from '@/lib/shared/url'

// Definisikan API Route '/api/payment/status'
export const Route = createFileRoute('/api/payment/status')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const orderId = url.searchParams.get('orderId')

        if (!orderId) {
          return new Response('Missing orderId', { status: 400 })
        }

        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
              status: true,
              transactionId: true,
              projectId: true,
              amount: true,
              type: true,
              paymentMetadata: true,
            },
          })

          if (!order) {
            return new Response('Order not found', { status: 404 })
          }

          let currentStatus = order.status

          // 1. Pengecekan Midtrans Upstream
          if (currentStatus === 'pending' && order.transactionId) {
            try {
              const core = await getCore()
              const midtransStatus = await core.transaction.status(order.transactionId)
              const transactionStatus = midtransStatus.transaction_status

              let dbStatus = 'pending'
              if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
                dbStatus = 'settled'
              } else if (
                transactionStatus === 'deny' ||
                transactionStatus === 'cancel' ||
                transactionStatus === 'expire'
              ) {
                dbStatus = transactionStatus
              }

              if (dbStatus !== 'pending') {
                // Perbarui status Order di DB
                await prisma.order.update({
                  where: { id: orderId },
                  data: {
                    status: dbStatus,
                    paymentType: midtransStatus.payment_type,
                  },
                })

                // Perbarui status Project & Estimate jika lunas (settled)
                if (dbStatus === 'settled') {
                  const updatedOrder = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { project: true },
                  })

                  if (updatedOrder?.project) {
                    const currentPaid = updatedOrder.project.paidAmount || 0
                    const newPaid = currentPaid + updatedOrder.amount

                    let paymentStatus = 'UNPAID'
                    if (updatedOrder.type === 'FULL' || updatedOrder.type === 'REPAYMENT') {
                      paymentStatus = 'PAID'
                    } else if (updatedOrder.type === 'DP') {
                      paymentStatus = 'PARTIAL'
                    }

                    await prisma.project.update({
                      where: { id: updatedOrder.project.id },
                      data: {
                        status: 'queue',
                        paymentStatus: paymentStatus,
                        paidAmount: newPaid,
                      },
                    })

                    if (updatedOrder.project.estimateId) {
                      await prisma.estimate.update({
                        where: { id: updatedOrder.project.estimateId },
                        data: { status: 'paid' },
                      })
                    }
                  }

                  // Proses komisi affiliate
                  const fullOrder = await prisma.order.findUnique({ where: { id: orderId } })
                  if (fullOrder) {
                    await processAffiliateCommission(
                      orderId,
                      fullOrder.amount,
                      fullOrder.paymentMetadata
                    )
                  }
                }

                currentStatus = dbStatus
              }
            } catch (midtransError) {
              console.error('Midtrans status check failed:', midtransError)
            }
          }

          // 2. Pengecekan Creem Upstream
          if (currentStatus === 'pending') {
            const checkoutId = url.searchParams.get('checkout_id') || order.transactionId

            if (checkoutId) {
              try {
                const creem = await getCreem()
                const creemStatus = await creem.checkouts.get({ checkoutId })
                const status = creemStatus.status as string

                if (status === 'completed' || status === 'paid') {
                  const existingOrder = await prisma.order.findUnique({ where: { id: orderId } })
                  const affiliateMetadata = existingOrder?.paymentMetadata

                  // Perbarui Order
                  const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                      status: 'paid',
                      transactionId: checkoutId,
                      paymentMetadata: creemStatus as unknown as CreemPaymentMetadata,
                    },
                    include: { project: true },
                  })

                  // Aktifkan Project/Estimate + perbarui paymentStatus & paidAmount
                  if (updatedOrder.project) {
                    const currentPaid = updatedOrder.project.paidAmount || 0
                    const newPaid = currentPaid + updatedOrder.amount

                    let paymentStatus = 'UNPAID'
                    if (updatedOrder.type === 'FULL' || updatedOrder.type === 'REPAYMENT') {
                      paymentStatus = 'PAID'
                    } else if (updatedOrder.type === 'DP') {
                      paymentStatus = 'PARTIAL'
                    }

                    await prisma.project.update({
                      where: { id: updatedOrder.project.id },
                      data: {
                        status: 'queue',
                        paymentStatus: paymentStatus,
                        paidAmount: newPaid,
                      },
                    })

                    if (updatedOrder.project.estimateId) {
                      await prisma.estimate.update({
                        where: { id: updatedOrder.project.estimateId },
                        data: { status: 'paid' },
                      })
                    }
                  }

                  // Proses komisi affiliate
                  await processAffiliateCommission(orderId, updatedOrder.amount, affiliateMetadata)
                  currentStatus = 'paid'
                }
              } catch (creemError) {
                console.error('Creem status check failed:', creemError)
              }
            }
          }

          const mode = url.searchParams.get('mode')
          if (mode === 'json') {
            return json({
              status: currentStatus,
              transactionId: order.transactionId,
            })
          }

          if (currentStatus === 'paid' || currentStatus === 'settled') {
            return Response.redirect(`${getAppUrl()}/invoices/${orderId}?status=success`, 302)
          } else {
            return Response.redirect(`${getAppUrl()}/invoices/${orderId}?status=pending`, 302)
          }
        } catch (error) {
          console.error('API Payment Status Error:', error)
          return new Response('Internal Server Error', { status: 500 })
        }
      },
    },
  },
})
