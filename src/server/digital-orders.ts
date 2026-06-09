import { createServerFn } from '@tanstack/react-start'
import { prisma } from "@/lib/config/db"
import { hexclaveServerApp } from "@/lib/config/hexclave"
import { isAdmin } from "@/lib/shared/auth-helpers"
import { generateLicenseForOrder } from "./licenses"
import { processAffiliateCommission } from "@/lib/affiliate/commission"
import { notifyNewDigitalOrder, notifyPaymentSuccess } from "@/lib/email/admin-notifications"
import { sendPaymentSuccessEmail } from "@/lib/email/client-notifications"
import { triggerExternalWebhook } from "@/lib/server/webhook-trigger"

const db = prisma

/**
 * Membuat DigitalOrder baru di database.
 * Dipanggil oleh API route `/api/digital-checkout`.
 */
export async function createDigitalOrder(data: {
  productId: string
  userId?: string
  userEmail: string
  userName?: string
  amount: number
}) {
  try {
    const order = await db.digitalOrder.create({
      data: {
        productId: data.productId,
        userId: data.userId || null,
        userEmail: data.userEmail,
        userName: data.userName || null,
        amount: data.amount,
        status: "PENDING",
      },
    })

    // Ambil nama produk untuk notifikasi
    const product = await db.product.findUnique({
      where: { id: data.productId },
      select: { name: true }
    })

    notifyNewDigitalOrder({
      orderId: order.id,
      productName: product?.name || "Digital Product",
      customerEmail: data.userEmail,
      amount: data.amount
    }).catch(err => console.error("Gagal mengirim notifikasi admin:", err))

    return { success: true, order }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error tidak diketahui"
    console.error("[CREATE_DIGITAL_ORDER_ERROR]", error)
    return { success: false, error: message }
  }
}

/**
 * Menyelesaikan pembayaran DigitalOrder setelah konfirmasi dari webhook Midtrans.
 * Update status ke PAID dan generate license key otomatis.
 */
export async function completeDigitalOrder(
  orderId: string,
  paymentId?: string,
  paymentType?: string
) {
  try {
    // Update status order ke PAID
    const order = await db.digitalOrder.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentId: paymentId || null,
        paymentType: paymentType || undefined,
      },
    })

    // Generate license key otomatis setelah pembayaran sukses
    const licenseResult = await generateLicenseForOrder(orderId)

    if (!licenseResult.success) {
      console.error(`[COMPLETE_ORDER] Pembuatan lisensi gagal untuk ${orderId}:`, licenseResult.error)
    }

    // Proses Komisi Afiliasi (jika ada referral)
    await processAffiliateCommission(orderId, order.amount, order.paymentMetadata as any)

    // Ambil detail produk untuk webhook & notifikasi
    const product = await db.product.findUnique({
      where: { id: order.productId },
      select: {
        name: true,
        slug: true,
        externalWebhookUrl: true,
        price: true,
        currency: true,
        interval: true
      }
    })

    // Pemicu Webhook Eksternal jika dikonfigurasi (untuk integrasi SaaS)
    if (product?.externalWebhookUrl) {
      triggerExternalWebhook(product.externalWebhookUrl, {
        orderId: order.id,
        email: order.userEmail,
        userId: order.userId,
        userName: order.userName,
        productId: product.slug,
        productUuid: order.productId,
        productName: product.name,
        amount: order.amount,
        status: "PAID",
        licenseKey: licenseResult.success ? licenseResult.license?.key : null,
        price: product.price,
        currency: product.currency,
        interval: product.interval || "one_time",
        metadata: (order.metadata as any) || {},
      }).catch(err => console.error("[WEBHOOK_TRIGGER_FAILED]", err))
    }

    // Notifikasi Admin
    notifyPaymentSuccess({
      orderId: order.id,
      amount: order.amount,
      customerName: order.userName || order.userEmail,
      type: "DIGITAL"
    }).catch(err => console.error("Gagal mengirim notifikasi sukses pembayaran ke admin:", err))

    // Notifikasi Klien
    sendPaymentSuccessEmail({
      to: order.userEmail,
      customerName: order.userName || order.userEmail.split('@')[0] || "Customer",
      orderId: order.id,
      amount: order.amount,
      productName: product?.name || "Digital Product"
    }).catch(err => console.error("Gagal mengirim notifikasi sukses pembayaran ke klien:", err))

    return { success: true, order, license: licenseResult }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error tidak diketahui"
    console.error("[COMPLETE_DIGITAL_ORDER_ERROR]", error)
    return { success: false, error: message }
  }
}

async function requireAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// Mengambil semua pesanan produk digital untuk dashboard admin
export const getDigitalOrdersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await db.digitalOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
        license: { select: { key: true, status: true } },
      },
    })
  })
