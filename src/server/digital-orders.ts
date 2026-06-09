import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'

async function requireAdmin() {
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Unauthorized')
}

// 1. Mengambil semua DigitalOrder
export const getDigitalOrdersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      await requireAdmin()
      const orders = await prisma.digitalOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, slug: true } },
          license: { select: { key: true, status: true } },
        },
      })
      return { success: true, orders: JSON.parse(JSON.stringify(orders)) }
    } catch (error) {
      return { success: false, error: (error as Error).message, orders: [] }
    }
  })

// 2. Batalkan transaksi
export const cancelDigitalOrderFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      await requireAdmin()
      const order = await prisma.digitalOrder.update({
        where: { id },
        data: { status: "CANCELLED" },
      })
      return { success: true, order: JSON.parse(JSON.stringify(order)) }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

// 3. Hapus transaksi secara permanen
export const deleteDigitalOrderFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      await requireAdmin()
      await prisma.digitalOrder.delete({
        where: { id },
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
