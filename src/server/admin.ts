import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { isAdmin } from '@/lib/shared/auth-helpers'

// Memastikan user adalah admin sebelum menjalankan query
async function requireAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// Mengambil data statistik untuk dashboard Super Admin
export const getSuperAdminDashboardData = createServerFn({ method: 'GET' })
  .validator((mode: string) => mode)
  .handler(async ({ data: mode }) => {
    await requireAdmin()
    const isDigital = mode === 'digital'

    if (isDigital) {
      const [revenueResult, activeCount, pendingCount, totalClientsResult] = await Promise.all([
        prisma.digitalOrder.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true }
        }),
        prisma.product.count({
          where: { isActive: true }
        }),
        prisma.digitalOrder.count({
          where: { status: 'PENDING' }
        }),
        prisma.digitalOrder.groupBy({
          by: ['userEmail'],
        })
      ])

      return {
        revenue: revenueResult._sum.amount || 0,
        activeCount,
        pendingCount,
        totalClients: totalClientsResult.length
      }
    } else {
      const [revenueResult, activeCount, pendingCount, totalClientsResult] = await Promise.all([
        prisma.estimate.aggregate({
          where: { status: 'paid' },
          _sum: { totalCost: true }
        }),
        prisma.project.count({
          where: { status: { in: ['queue', 'dev'] } }
        }),
        prisma.estimate.count({
          where: { status: 'pending_payment' }
        }),
        prisma.project.groupBy({
          by: ['userId'],
        })
      ])

      return {
        revenue: revenueResult._sum.totalCost || 0,
        activeCount,
        pendingCount,
        totalClients: totalClientsResult.length
      }
    }
  })

// Mengambil data statistik untuk dashboard Keuangan (Billing)
export const getBillingDashboardData = createServerFn({ method: 'GET' })
  .validator((mode: string) => mode)
  .handler(async ({ data: mode }) => {
    await requireAdmin()
    const isDigital = mode === 'digital'

    const stats = await prisma.$transaction(async (tx) => {
      if (isDigital) {
        const digitalRevenue = await tx.digitalOrder.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true }
        })

        const pendingDigital = await tx.digitalOrder.count({
          where: { status: 'PENDING' }
        })

        return { 
          revenue: digitalRevenue._sum.amount || 0, 
          pendingOrders: pendingDigital 
        }
      } else {
        const serviceRevenue = await tx.estimate.aggregate({
          where: { status: 'paid' },
          _sum: { totalCost: true }
        })

        const pendingOrders = await tx.estimate.count({
          where: { status: 'pending_payment' }
        })

        return { 
          revenue: serviceRevenue._sum.totalCost || 0, 
          pendingOrders
        }
      }
    })

    // Konversi USD ke IDR
    const { paymentService } = await import('@/lib/server/payment-service')
    const { rate } = await paymentService.convertToIDR(1)
    const revenueIDR = stats.revenue * rate

    return {
      revenue: stats.revenue,
      pendingOrders: stats.pendingOrders,
      revenueIDR,
    }
  })

// Mengambil data statistik untuk dashboard Manajemen Proyek (PM)
export const getProjectDashboardData = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()

    const stats = await prisma.$transaction(async (tx) => {
      const activeProjects = await tx.project.count({
        where: { status: { in: ['queue', 'dev'] } }
      })
      const totalClients = await tx.project.groupBy({
        by: ['userId'],
      })
      return { activeProjects, totalClients: totalClients.length }
    })

    return {
      activeProjects: stats.activeProjects,
      totalClients: stats.totalClients,
    }
  })

// Mengambil konfigurasi dan kurs mata uang
export const getCurrencyConfigFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const { currencyService } = await import('@/lib/server/currency-service')
    const [config, rates] = await Promise.all([
      currencyService.getConfig(),
      currencyService.getRates()
    ])
    return {
      config: config || { apiKey: "", intervalHours: 24 },
      rates
    }
  })

// Menyimpan konfigurasi mata uang baru
export const saveCurrencyConfigFn = createServerFn({ method: 'POST' })
  .validator((data: { apiKey: string; intervalHours: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    if (!data.apiKey) throw new Error("API Key required")
    const { currencyService } = await import('@/lib/server/currency-service')
    await currencyService.saveConfig(data.apiKey, Number(data.intervalHours) || 24)
    return { success: true }
  })

// Memperbarui kurs mata uang secara paksa
export const forceUpdateCurrencyRatesFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    await requireAdmin()
    const { currencyService } = await import('@/lib/server/currency-service')
    const config = await currencyService.getConfig()
    if (!config?.apiKey) throw new Error("API Key not configured")
    const rates = await currencyService.fetchAndCacheRates(config.apiKey)
    return rates
  })

// Mengambil semua testimonial untuk dashboard admin
export const getAllTestimonialsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return testimonials.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  })

// Menyetujui atau menyembunyikan testimonial
export const toggleTestimonialStatusFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    await prisma.testimonial.update({
      where: { id: data.id },
      data: { isActive: data.isActive },
    })
    return { success: true }
  })

// Menghapus testimonial dari database
export const deleteTestimonialFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await prisma.testimonial.delete({
      where: { id },
    })
    return { success: true }
  })


