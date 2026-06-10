import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { paymentGatewayService } from '@/lib/server/payment-gateway-service'
import { validateCoupon } from '@/lib/server/marketing'
import { getCurrentUser } from '@/lib/shared/auth-helpers'
import { secureRandomInt } from '@/lib/utils/crypto'

export const Route = createFileRoute('/api/digital-checkout')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let productId = ""
        let userEmail = ""
        try {
          const user = await getCurrentUser()
          if (!user) {
            return json({ error: "Unauthorized" }, { status: 401 })
          }

          const body = await request.json()
          productId = body.productId
          const email = body.email
          const { name, affiliateCode, couponCode, metadata } = body
          
          const userId = user.id
          userEmail = user.primaryEmail || email
          const userName = user.displayName || name

          if (!productId || !userEmail) {
            return json(
              { error: "productId dan email wajib diisi" },
              { status: 400 }
            )
          }

          const product = await prisma.product.findUnique({
            where: { id: productId },
          })

          if (!product || !product.isActive) {
            return json(
              { error: "Produk tidak ditemukan atau tidak aktif" },
              { status: 404 }
            )
          }

          if (product.price <= 0) {
            return json(
              { error: "Harga produk tidak valid" },
              { status: 400 }
            )
          }

          const hasGateway = await paymentGatewayService.hasActiveGateway()
          if (!hasGateway) {
            return json(
              { error: "Payment gateway belum dikonfigurasi. Hubungi admin." },
              { status: 503 }
            )
          }

          const orderId = `DIGI-${Date.now()}-${secureRandomInt(0, 1000)}`

          let finalAmount = product.price
          if (couponCode) {
            const couponResult = await validateCoupon(couponCode, "DIGITAL")
            if (couponResult.valid && couponResult.coupon) {
              const coupon = couponResult.coupon
              if (coupon.discountType === 'percentage') {
                finalAmount = product.price * (1 - coupon.discountValue / 100)
              } else {
                finalAmount = Math.max(0, product.price - coupon.discountValue)
              }
            }
          }

          await prisma.digitalOrder.create({
            data: {
              id: orderId,
              productId: product.id,
              userId: userId || null,
              userEmail: userEmail,
              userName: userName || null,
              amount: finalAmount,
              status: "PENDING",
              metadata: metadata || {},
              paymentMetadata: {
                ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
                ...(couponCode ? { coupon_code: couponCode } : {}),
              },
            },
          })

          console.log(`[DIGITAL_CHECKOUT] Order ${orderId} created (Ready for Core API payment)`);

          return json({
            orderId: orderId,
            redirectUrl: `/digital-invoices/${orderId}`
          })

        } catch (error: unknown) {
          console.error("[DIGITAL_CHECKOUT_ERROR]", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            productId: productId,
            userEmail: userEmail,
            error: error
          })
          return json(
            { 
              error: "Terjadi kesalahan saat memproses checkout",
              details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
            },
            { status: 500 }
          )
        }
      }
    }
  }
})
