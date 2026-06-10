import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCore } from '@/lib/integrations/midtrans'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { paymentService } from '@/lib/server/payment-service'
import type { MidtransChargeParameter } from '@/types/payment'

export const Route = createFileRoute('/api/payment/midtrans/charge')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const { orderId, paymentType, bank } = body
          const user = await getCurrentUser()

          if (!user) {
            return json({ error: "Unauthorized" }, { status: 401 })
          }

          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { project: true }
          })

          if (!order) {
            return json({ error: "Order not found" }, { status: 404 })
          }

          if (order.userId !== user.id) {
            return json({ error: "Forbidden" }, { status: 403 })
          }

          const uniqueTransactionId = `${orderId}-${Date.now()}`

          const firstName = user?.displayName?.split(" ")[0] || "Valued"
          const lastName = user?.displayName?.split(" ").slice(1).join(" ") || "Client"
          const email = user?.primaryEmail || "client@example.com"
          const phone = "08123456789"

          const customerDetails = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            billing_address: {
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone,
              address: "Digital Service",
              city: "Jakarta",
              postal_code: "12345",
              country_code: "IDN"
            },
            shipping_address: {
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone,
              address: "Digital Service",
              city: "Jakarta",
              postal_code: "12345",
              country_code: "IDN"
            }
          }

          const { idrAmount } = await paymentService.convertToIDR(order.amount)

          const parameter: MidtransChargeParameter = {
            payment_type: paymentType,
            transaction_details: {
              order_id: uniqueTransactionId,
              gross_amount: idrAmount,
            },
            customer_details: customerDetails,
            item_details: [
              {
                id: order.projectId || "PROJECT",
                price: idrAmount,
                quantity: 1,
                name: order.project?.title?.substring(0, 50) || "Agency Service",
                merchant_name: "Crediblemark"
              }
            ]
          }

          switch (paymentType) {
            case 'qris':
            case 'gopay':
              parameter.payment_type = 'qris'
              parameter.qris = { acquirer: 'gopay' }
              break

            case 'shopeepay':
              parameter.payment_type = 'shopeepay'
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              parameter.shopeepay = { callback_url: `${appUrl}/invoices/${orderId}` }
              break

            case 'bank_transfer':
              parameter.payment_type = 'bank_transfer'
              parameter.bank_transfer = { bank: bank }
              break

            case 'permata':
              parameter.payment_type = 'permata'
              break

            case 'echannel':
              parameter.payment_type = 'echannel'
              parameter.echannel = {
                bill_info1: "Payment for:",
                bill_info2: "Order #" + orderId.slice(-8)
              }
              break

            case 'cstore':
              parameter.payment_type = 'cstore'
              parameter.cstore = {
                store: bank,
                message: "Payment Order #" + orderId
              }
              break

            default:
              break
          }

          const core = await getCore()
          const chargeResponse = await core.charge(parameter)

          await prisma.order.update({
            where: { id: orderId },
            data: {
              transactionId: uniqueTransactionId,
              paymentType: paymentType,
              paymentMetadata: {
                ...(order.paymentMetadata as object || {}),
                ...chargeResponse
              }
            }
          })

          return json(chargeResponse)

        } catch (error: unknown) {
          console.error("[CORE_CHARGE_ERROR]", error)
          const errorMessage = error instanceof Error ? error.message : "Internal Server Error"
          return json({ message: errorMessage }, { status: 500 })
        }
      }
    }
  }
})
