import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { creem as getCreem } from '@/lib/integrations/creem'
import { getCurrentUser } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/api/payment/creem')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const user = await getCurrentUser()
          if (!user) {
            return json({ error: "Unauthorized" }, { status: 401 })
          }

          const { orderId } = await request.json()

          if (!orderId) {
            return json({ message: "Order ID is required" }, { status: 400 })
          }

          const isDigital = orderId.startsWith("DIGI-")
          let amount = 0
          let title = ""
          let creemProductIdFromService = null
          let paymentMetadata: Record<string, unknown> = {}
          let orderUserId = ""

          if (isDigital) {
            const digitalOrder = await prisma.digitalOrder.findUnique({
              where: { id: orderId },
              include: { product: true }
            })

            if (!digitalOrder) {
              return json({ message: "Digital Order not found" }, { status: 404 })
            }

            amount = digitalOrder.amount
            title = digitalOrder.product.name
            paymentMetadata = (digitalOrder.paymentMetadata as unknown as Record<string, unknown>) || {}
            orderUserId = digitalOrder.userId || ""
          } else {
            const order = await prisma.order.findUnique({
              where: { id: orderId },
              include: {
                project: {
                  include: { service: true }
                }
              }
            })

            if (!order) {
              return json({ message: "Order not found" }, { status: 404 })
            }

            amount = order.amount
            title = order.project?.service?.title || order.project?.title || "Project Payment"
            creemProductIdFromService = (order.project?.service as { creemProductId?: string | null })?.creemProductId
            paymentMetadata = (order.paymentMetadata as unknown as Record<string, unknown>) || {}
            orderUserId = order.userId
          }

          if (orderUserId && orderUserId !== user.id) {
            return json({ message: "Forbidden" }, { status: 403 })
          }

          let productId = ""

          if ((paymentMetadata as Record<string, string>).creemProductId) {
            productId = (paymentMetadata as Record<string, string>).creemProductId as string
          } else if (creemProductIdFromService) {
            productId = creemProductIdFromService
          } else {
            const { resetCreemInstance } = await import("@/lib/integrations/creem")
            resetCreemInstance()

            const creem = await getCreem()
            const product = await creem.products.create({
              name: isDigital ? title : `Invoice #${orderId.slice(-8).toUpperCase()}`,
              description: `Payment for Order #${orderId}`,
              price: Math.round(amount * 100),
              currency: "USD",
              billingType: "onetime",
              taxMode: "inclusive",
              taxCategory: "digital-goods-service"
            })
            productId = product.id

            const updateData = {
              paymentMetadata: {
                ...paymentMetadata,
                creemProductId: productId
              }
            }

            if (isDigital) {
              await prisma.digitalOrder.update({
                where: { id: orderId },
                data: updateData
              })
            } else {
              await prisma.order.update({
                where: { id: orderId },
                data: updateData
              })
            }
          }

          const creem = await getCreem()
          const checkout = await creem.checkouts.create({
            productId: productId,
            successUrl: isDigital
              ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/digital-invoices/${orderId}`
              : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/status?orderId=${orderId}`,
            metadata: {
              orderId: orderId
            },
          })

          const finalUpdate: { paymentType: string; paymentId?: string; transactionId?: string } = { paymentType: "creem" }
          if (isDigital) finalUpdate.paymentId = checkout.id
          else finalUpdate.transactionId = checkout.id

          if (isDigital) {
            await prisma.digitalOrder.update({
              where: { id: orderId },
              data: finalUpdate
            })
          } else {
            await prisma.order.update({
              where: { id: orderId },
              data: finalUpdate
            })
          }

          return json({ checkout_url: checkout.checkoutUrl })

        } catch (error: unknown) {
          console.error("[CREEM_ERROR]", error instanceof Error ? error.message : error)
          return json(
            { message: (error instanceof Error ? error.message : "Unknown error") || "Failed to initiate Creem payment" },
            { status: 500 }
          )
        }
      }
    }
  }
})
