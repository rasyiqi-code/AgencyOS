import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/api/v1/subscription/check')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url)
          const email = url.searchParams.get('email')
          const productId = url.searchParams.get('productId') ||
                            url.searchParams.get('productSlug') ||
                            url.searchParams.get('product_slug')
          const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '')

          if (!apiKey) {
            return json({ error: 'Missing API Key' }, { status: 401 })
          }

          const dbKey = await prisma.systemKey.findFirst({
            where: {
              key: apiKey,
              provider: 'agency-os',
              isActive: true
            }
          })

          const envKey = process.env.AGENCY_OS_API_KEY
          const isValid = !!dbKey || (envKey && apiKey === envKey)

          if (!isValid) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          if (!email || !productId) {
            return json({ error: 'Missing email or productId' }, { status: 400 })
          }

          const order = await prisma.digitalOrder.findFirst({
            where: {
              userEmail: email,
              status: 'PAID',
              OR: [
                { product: { slug: productId } },
                { productId }
              ]
            },
            include: {
              license: true,
              product: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          })

          if (!order) {
            return json({
              active: false,
              message: 'No active subscription found for this email and product.'
            })
          }

          let isExpired = false
          if (order.license?.expiresAt) {
            isExpired = new Date() > new Date(order.license.expiresAt)
          }

          if (isExpired) {
            return json({
              active: false,
              message: 'Subscription has expired.',
              expiredAt: order.license?.expiresAt
            })
          }

          if (order.product.type === 'saas' && order.license && order.license.activations === 0) {
            try {
              await prisma.license.update({
                where: { id: order.license.id },
                data: {
                  activations: { increment: 1 },
                  metadata: {
                    ...(order.license.metadata as object || {}),
                    activatedVia: 'saas_check',
                    activatedAt: new Date().toISOString()
                  } as any
                }
              })
              order.license.activations = 1
            } catch (e) {
              console.error('[AUTO_ACTIVATE_ERROR]', e)
            }
          }

          return json({
            active: true,
            orderId: order.id,
            email: order.userEmail,
            productName: order.product.name,
            purchaseDate: order.createdAt,
            expiresAt: order.license?.expiresAt || null,
            licenseKey: order.license?.key || null,
            price: order.product.price,
            currency: order.product.currency,
            interval: order.product.interval || 'one_time',
            metadata: order.metadata || {},
          })
        } catch (error) {
          console.error('[SUBSCRIPTION_CHECK_API_ERROR]', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
