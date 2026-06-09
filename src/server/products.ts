import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { z } from 'zod'

// Validasi akses admin global
async function requireAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// Zod schema untuk validasi produk digital
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional(),
  name_id: z.string().optional(),
  description_id: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  type: z.string(), // "plugin" | "template" | "saas"
  purchaseType: z.string().default("one_time"), // "one_time" | "subscription"
  interval: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  image: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  currency: z.string().default("USD"), // "USD" | "IDR"
  externalWebhookUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
})

const createManualLicenseSchema = z.object({
  productId: z.string(),
  maxActivations: z.number().optional().default(1),
  expiresAt: z.string().optional().nullable(),
  status: z.string().optional().default('active'),
  userId: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional()
})

// 1. Mengambil Semua Produk Digital
export const getAdminProductsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { licenses: true },
        },
      },
    })
    return products.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  })

// 2. Mengambil Semua Lisensi API
export const getAdminLicensesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const licenses = await prisma.license.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { name: true, slug: true }
        },
        digitalOrder: {
          select: { userEmail: true, userName: true, status: true }
        }
      }
    })

    return licenses.map(l => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      expiresAt: l.expiresAt?.toISOString() || null,
      product: l.product ? {
        name: l.product.name,
        slug: l.product.slug
      } : null,
      digitalOrder: l.digitalOrder ? {
        userEmail: l.digitalOrder.userEmail,
        userName: l.digitalOrder.userName,
        status: l.digitalOrder.status
      } : null
    }))
  })

// 3. Membuat Produk Digital Baru
export const createDigitalProductFn = createServerFn({ method: 'POST' })
  .validator(productSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    // Cek duplikasi slug
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (existing) throw new Error("Slug already exists")

    const product = await prisma.product.create({
      data: {
        ...data,
        price: Number(data.price) || 0,
      }
    })

    // Kirim notifikasi push otomatis untuk produk baru rilis
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const subscriptions = await prisma.pushSubscription.findMany()
      if (subscriptions.length > 0) {
        const pushSubs = subscriptions.map((s) => ({
          endpoint: s.endpoint,
          keys: {
            p256dh: s.p256dh,
            auth: s.auth
          }
        }))
        const { broadcastPushNotification } = await import("@/lib/server/push")
        await broadcastPushNotification(pushSubs, {
          title: "Produk Baru Rilis! 🔥",
          body: `${data.name} kini tersedia di AgencyOS. Cek detail dan fiturnya sekarang!`,
          url: `${appUrl}/products/${data.slug}`,
        })
      }
    } catch (err: unknown) {
      console.error("Auto Push Product Error:", err)
    }

    return { success: true, product }
  })

// 4. Memperbarui Produk Digital
export const updateDigitalProductFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), body: productSchema.partial() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const { id, body } = data

    const product = await prisma.product.update({
      where: { id },
      data: body
    })

    return { success: true, product }
  })

// 5. Menghapus Produk Digital
export const deleteDigitalProductFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()

    const [licenseCount, orderCount] = await Promise.all([
      prisma.license.count({ where: { productId: id } }),
      prisma.digitalOrder.count({ where: { productId: id } }),
    ])

    if (licenseCount > 0) {
      throw new Error(`Produk memiliki ${licenseCount} license aktif. Hapus license terlebih dahulu.`)
    }

    if (orderCount > 0) {
      throw new Error(`Produk memiliki ${orderCount} order terkait. Tidak bisa dihapus.`)
    }

    await prisma.product.delete({ where: { id } })
    return { success: true }
  })

// 6. Membuat Lisensi API Secara Manual
export const createManualLicenseFn = createServerFn({ method: 'POST' })
  .validator(createManualLicenseSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const { productId, maxActivations, expiresAt, status, userId, metadata } = data

    const { generateKey } = await import("@/lib/utils/crypto")
    const key = generateKey()

    const license = await prisma.license.create({
      data: {
        key,
        productId,
        maxActivations: maxActivations || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: status || 'active',
        userId: userId || undefined,
        metadata: (metadata || undefined) as any
      },
    })

    return { success: true, data: { key: license.key } }
  })

// 7. Menghapus Lisensi API
export const deleteLicenseFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: licenseId }) => {
    await requireAdmin()
    await prisma.license.delete({
      where: { id: licenseId }
    })
    return { success: true }
  })
