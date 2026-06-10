import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { paymentService } from '@/lib/server/payment-service'
import { getCore } from '@/lib/integrations/midtrans'
import type { MidtransChargeParameter } from '@/types/payment'

export const Route = createFileRoute('/api/digital-payment/charge')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const { orderId, paymentType, bank } = await request.json()

          const order = await prisma.digitalOrder.findUnique({
            where: { id: orderId },
            include: { product: true }
          })

          if (!order) {
            return json({ error: 'Order not found' }, { status: 404 })
          }

          if (order.status === 'PAID' || order.status === 'settled') {
            return json({ error: 'Order already paid' }, { status: 400 })
          }

          const uniqueTransactionId = `${orderId}-${Date.now()}`

          const customerDetails = {
            first_name: order.userName || order.userEmail.split('@')[0],
            email: order.userEmail,
            phone: '08123456789',
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
                id: order.productId,
                price: idrAmount,
                quantity: 1,
                name: order.product.name.substring(0, 50),
                merchant_name: 'AgencyOS Digital'
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
              parameter.shopeepay = { callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/digital-invoices/${orderId}` }
              break

            case 'bank_transfer':
              parameter.payment_type = 'bank_transfer'
              parameter.bank_transfer = { bank }
              break

            case 'permata':
              parameter.payment_type = 'permata'
              break

            case 'echannel':
              parameter.payment_type = 'echannel'
              parameter.echannel = {
                bill_info1: 'Payment for:',
                bill_info2: 'Order #' + orderId.slice(-8)
              }
              break

            case 'cstore':
              parameter.payment_type = 'cstore'
              parameter.cstore = {
                store: bank,
                message: 'Order #' + orderId
              }
              break
          }

          const core = await getCore()
          const chargeResponse = await core.charge(parameter)

          await prisma.digitalOrder.update({
            where: { id: orderId },
            data: {
              paymentId: uniqueTransactionId,
              paymentType,
              paymentMetadata: chargeResponse as any
            }
          })

          return json(chargeResponse)
        } catch (error: any) {
          console.error('[DIGITAL_CORE_CHARGE_ERROR]', error)
          return json({ error: error.message || 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
