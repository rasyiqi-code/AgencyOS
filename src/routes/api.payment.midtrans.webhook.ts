import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import crypto from "crypto"
import { paymentGatewayService } from '@/lib/server/payment-gateway-service'
import { processAffiliateCommission } from '@/lib/affiliate/commission'
import { completeDigitalOrder } from '@/src/server/digital-orders'
import { notifyPaymentSuccess } from '@/lib/email/admin-notifications'

export const Route = createFileRoute('/api/payment/midtrans/webhook')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            payment_type,
            transaction_id,
          } = body

          const midtransConfig = await paymentGatewayService.getMidtransConfig()

          const serverKey = midtransConfig.serverKey
          if (!serverKey) {
            console.error("[MIDTRANS_WEBHOOK] Server key not configured")
            return new Response("Configuration error", { status: 500 })
          }

          const hashed = crypto
            .createHash("sha512")
            .update(order_id + status_code + gross_amount + serverKey)
            .digest("hex")

          if (hashed !== signature_key) {
            return new Response("Invalid signature", { status: 403 })
          }

          console.log(`[MIDTRANS_WEBHOOK] Order: ${order_id}, Status: ${transaction_status}`)

          if (order_id.startsWith("DIGI-")) {
            return await handleDigitalOrderWebhook(order_id, transaction_status, transaction_id, payment_type)
          }

          return await handleProjectOrderWebhook(
            order_id, transaction_status, transaction_id, payment_type
          )

        } catch (error) {
          console.error("[MIDTRANS_WEBHOOK_ERROR]", error)
          return new Response("Internal Error", { status: 500 })
        }
      }
    }
  }
})

async function handleDigitalOrderWebhook(
  orderId: string,
  transactionStatus: string,
  transactionId: string,
  paymentType?: string
) {
  const digitalOrder = await prisma.digitalOrder.findFirst({
    where: { paymentId: orderId },
  })

  if (!digitalOrder) {
    console.error(`[MIDTRANS_WEBHOOK] Digital order not found for paymentId: ${orderId}`)
    return json(
      { status: "error", message: "Digital order not found" },
      { status: 404 }
    )
  }

  if (digitalOrder.status === 'PAID') {
    console.log(`[MIDTRANS_WEBHOOK] Digital order ${digitalOrder.id} already PAID, skipping.`)
    return json({ status: "ok", message: "Already processed" })
  }

  const actualOrderId = digitalOrder.id

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    const result = await completeDigitalOrder(actualOrderId, transactionId, paymentType)

    if (!result.success) {
      console.error(`[MIDTRANS_WEBHOOK] Failed to complete digital order ${actualOrderId}:`, result.error)
      return json({ status: "error", message: result.error }, { status: 500 })
    }

    console.log(`[MIDTRANS_WEBHOOK] Digital order ${actualOrderId} completed with license`)
  } else if (
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire"
  ) {
    await prisma.digitalOrder.update({
      where: { id: actualOrderId },
      data: {
        status: transactionStatus === "expire" ? "EXPIRED" : "FAILED",
        paymentId: transactionId,
      },
    })

    console.log(`[MIDTRANS_WEBHOOK] Digital order ${actualOrderId} status: ${transactionStatus}`)
  }

  return json({ status: "ok" })
}

async function handleProjectOrderWebhook(
  orderId: string,
  transactionStatus: string,
  transactionId: string,
  paymentType: string
) {
  let dbStatus = "pending"
  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    dbStatus = "settled"
  } else if (
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire"
  ) {
    dbStatus = transactionStatus
  }

  let existingOrder = await prisma.order.findUnique({ where: { id: orderId } })

  if (!existingOrder) {
    existingOrder = await prisma.order.findUnique({
      where: { transactionId: orderId },
    })
  }

  if (!existingOrder) {
    console.error(`[MIDTRANS_WEBHOOK] Order not found for order_id: ${orderId}`)
    return json(
      { status: "error", message: "Order not found" },
      { status: 404 }
    )
  }

  if (existingOrder.status === 'settled' && (transactionStatus === 'capture' || transactionStatus === 'settlement')) {
    console.log(`[MIDTRANS_WEBHOOK] Order ${existingOrder.id} already settled, skipping.`)
    return json({ status: "ok", message: "Already processed" })
  }

  const order = await prisma.order.update({
    where: { id: existingOrder.id },
    data: {
      status: dbStatus,
      transactionId: transactionId,
      paymentType: paymentType,
    },
    include: { project: true },
  })

  if (dbStatus === "settled" && order.project) {
    const currentPaid = order.project.paidAmount || 0

    const orderRate = order.exchangeRate || 1
    const normalizedOrderAmount = order.currency === 'IDR' && order.amount > 5000
      ? order.amount / orderRate
      : order.amount

    const newPaid = currentPaid + normalizedOrderAmount

    let paymentStatus = "UNPAID"
    if (order.type === "FULL" || order.type === "REPAYMENT") {
      paymentStatus = "PAID"
    } else if (order.type === "DP") {
      paymentStatus = "PARTIAL"
    }

    const isSubscription = order.project.subscriptionStatus === 'pending' || order.project.subscriptionStatus === 'active'
    let nextBillingDate = undefined
    if (isSubscription) {
      nextBillingDate = new Date()
      const summaryText = order.project.description || ""
      if (summaryText.includes('Yearly') || summaryText.toLowerCase().includes('(yearly)')) {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
      } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      }
    }

    await prisma.project.update({
      where: { id: order.project.id },
      data: {
        ...(order.project.status === 'pending' || order.project.status === 'draft' || order.project.status === 'payment_pending' ? { status: "queue" } : {}),
        paymentStatus: paymentStatus,
        paidAmount: newPaid,
        ...(isSubscription ? {
          subscriptionStatus: 'active',
          subscriptionEndsAt: nextBillingDate
        } : {})
      },
    })

    if (order.project.estimateId) {
      await prisma.estimate.update({
        where: { id: order.project.estimateId },
        data: { status: "paid" },
      })
    }

    await processAffiliateCommission(existingOrder.id, order.amount, order.paymentMetadata)

    notifyPaymentSuccess({
      orderId: order.id,
      amount: order.amount,
      customerName: order.project?.clientName || "Client",
      type: "SERVICE"
    }).catch(err => console.error("Failed to send admin notification:", err))
  }

  return json({ status: "ok" })
}
