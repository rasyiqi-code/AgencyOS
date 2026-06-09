import { createServerFn } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'

export const getClientLicenses = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return { success: false, licenses: [] }

    const licenses = await prisma.license.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      licenses: licenses.map(l => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
        expiresAt: l.expiresAt?.toISOString() ?? null,
        activations: l.activations,
        product: l.product
          ? {
              ...l.product,
              image: l.product.image,
              fileUrl: l.product.fileUrl,
              purchaseType: l.product.purchaseType ?? 'one_time',
            }
          : null,
      })),
    }
  },
)

export const regenerateLicenseFn = createServerFn({ method: 'POST' })
  .validator((licenseId: string) => licenseId)
  .handler(async ({ data: licenseId }) => {
    // Mendapatkan user yang sedang login
    const user = await hexclaveServerApp.getUser()
    if (!user) return { success: false }

    // Memeriksa kepemilikan lisensi
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
    })
    if (!license || license.userId !== user.id) {
      return { success: false }
    }

    const crypto = await import('crypto')
    const newKey = `GOS-${crypto.randomUUID().toUpperCase().slice(0, 8)}-${crypto.randomUUID().toUpperCase().slice(0, 8)}-${crypto.randomUUID().toUpperCase().slice(0, 8)}`

    // Memperbarui key lisensi di database (menggunakan field 'key' bukan 'licenseKey')
    const updated = await prisma.license.update({
      where: { id: licenseId },
      data: {
        key: newKey,
        activations: 0,
      },
    })

    return {
      success: true,
      license: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      },
    }
  })

// Helper untuk membuat lisensi baru setelah pembayaran order digital sukses
export async function generateLicenseForOrder(orderId: string) {
  try {
    const order = await prisma.digitalOrder.findUnique({
      where: { id: orderId },
      include: { product: true, license: true }
    })

    if (!order) throw new Error("Order not found")
    if (order.status !== 'PAID') throw new Error("Order not paid")
    if (order.license) return { success: true, license: order.license }

    const crypto = await import('crypto')
    const key = `GOS-${crypto.randomUUID().toUpperCase().slice(0, 8)}-${crypto.randomUUID().toUpperCase().slice(0, 8)}-${crypto.randomUUID().toUpperCase().slice(0, 8)}`

    // Hitung masa berlaku untuk subscription
    let expiresAt = undefined
    if (order.product.purchaseType === 'subscription') {
      const now = new Date()
      if (order.product.interval === 'month') {
        now.setMonth(now.getMonth() + 1)
      } else if (order.product.interval === 'year') {
        now.setFullYear(now.getFullYear() + 1)
      }
      expiresAt = now
    }

    const license = await prisma.license.create({
      data: {
        key,
        productId: order.productId,
        userId: order.userId,
        expiresAt,
        maxActivations: 1,
        status: 'active'
      }
    })

    // Update order dengan licenseId
    await prisma.digitalOrder.update({
      where: { id: orderId },
      data: { licenseId: license.id }
    })

    return { success: true, license }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}


