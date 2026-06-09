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

