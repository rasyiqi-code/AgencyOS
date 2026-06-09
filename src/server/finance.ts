import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { canManageBilling } from '@/lib/shared/auth-helpers'
import { z } from 'zod'

// Validasi akses administrator keuangan
async function requireBillingAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await canManageBilling()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// Interface untuk data user Stack Auth
interface StackUser {
  id: string
  displayName: string | null
  primaryEmail: string | null
}

// 1. Mengambil Daftar Pesanan Jasa (Orders) dengan enrichment nama klien
export const getAdminFinanceOrdersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireBillingAdmin()

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          include: {
            estimate: {
              include: {
                service: true
              }
            },
            service: true
          }
        }
      }
    })

    // Resolusi nama klien dari Stack Auth untuk data yang tidak lengkap
    const missingClientNameOrders = orders.filter(o => {
      const p = o.project
      return o.userId && (!p || !p.clientName || p.clientName === "Client")
    })

    const uniqueUserIds = Array.from(new Set(
      missingClientNameOrders.map(o => o.userId as string)
    ))

    const stackUsers = await Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          return await hexclaveServerApp.getUser(id)
        } catch (e) {
          console.error(`Gagal mengambil user ${id}:`, e)
          return null
        }
      })
    )
    const userMap = new Map<string, StackUser>(
      stackUsers.filter(Boolean).map(u => [u!.id, u as StackUser])
    )

    // Menyusun data keuangan yang telah diperkaya dengan info nama klien
    return orders.map(o => {
      const project = o.project
      const estimate = project?.estimate
      const service = project?.service || estimate?.service

      let clientName = project?.clientName || "Client"
      if (o.userId && (clientName === "Client" || !clientName)) {
        const u = userMap.get(o.userId)
        if (u) {
          clientName = u.displayName || u.primaryEmail || "Unnamed Client"
        }
      }

      return {
        id: o.id,
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        title: project?.title || estimate?.title || service?.title || "Untitled Transaction",
        totalCost: o.amount,
        proofUrl: o.proofUrl || null,
        service: service ? {
          id: service.id,
          title: service.title,
          currency: service.currency || 'USD'
        } : null,
        project: project ? {
          id: project.id,
          title: project.title,
          description: project.description,
          clientName: clientName,
          userId: project.userId,
          paymentStatus: project.paymentStatus,
          paidAmount: project.paidAmount,
          totalAmount: project.totalAmount,
          order: {
            proofUrl: o.proofUrl,
            paymentType: o.type,
            paymentMethod: o.paymentType,
            paymentMetadata: o.paymentMetadata || null
          }
        } : null,
        paymentType: o.type || null,
        paymentMethod: o.paymentType || null,
        paymentMetadata: o.paymentMetadata || null,
        currency: o.currency || 'USD',
        isLegacyMismatched: o.currency === 'IDR' && o.amount < 5000,
        exchangeRate: o.exchangeRate && o.exchangeRate !== 1 ? o.exchangeRate : undefined,
        transactionAmount: o.amount,
        screens: (estimate?.screens || []) as Record<string, unknown>[],
        apis: (estimate?.apis || []) as Record<string, unknown>[],
        estimateId: estimate?.id || null
      }
    })
  })

// Zod schemas untuk mutasi quotes
const updateQuotePriceSchema = z.object({
  estimateId: z.string(),
  projectId: z.string().nullable(),
  newPrice: z.number(),
  contextCurrency: z.string(),
  activeRate: z.number().optional()
})

const createManualQuoteSchema = z.object({
  serviceId: z.string(),
  userId: z.string(),
  clientName: z.string(),
  clientEmail: z.string().optional(),
  amount: z.number(),
  contextCurrency: z.string(),
  activeRate: z.number().optional()
})

const deleteQuoteSchema = z.object({
  estimateId: z.string(),
  userId: z.string().optional()
})

// 2. Mengambil Estimasi & Katalog Quotes
export const getAdminFinanceQuotesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireBillingAdmin()

    const [estimates, services, tickets, projects] = await Promise.all([
      prisma.estimate.findMany({
        include: {
          service: true,
          project: true,
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.service.findMany({
        where: { isActive: true }
      }),
      prisma.ticket.findMany({
        where: { userId: { not: null } },
        select: { userId: true, name: true, email: true }
      }),
      prisma.project.findMany({
        select: { userId: true, clientName: true }
      })
    ])

    // Resolusi user Stack Auth
    const { getCachedUsers } = await import('@/lib/config/hexclave')
    const stackUsers = await getCachedUsers()

    const userMap = new Map<string, { id: string, name: string, email?: string }>()
    userMap.set('OFFLINE', { id: 'OFFLINE', name: 'Offline / Transaksi Luar Sistem', email: 'N/A' })

    stackUsers.forEach((u: StackUser) => {
      userMap.set(u.id, {
        id: u.id,
        name: u.displayName || u.primaryEmail || 'User',
        email: u.primaryEmail || ''
      })
    })

    tickets.forEach((t) => {
      if (t.userId && t.userId !== 'OFFLINE') {
        const existing = userMap.get(t.userId)
        const betterName = (t.name && t.name !== "Client" && t.name !== "Unknown")
          ? t.name
          : (existing?.name || t.name || 'Unknown')

        userMap.set(t.userId, {
          id: t.userId,
          name: betterName,
          email: t.email || existing?.email || ''
        })
      }
    })

    projects.forEach((p) => {
      if (p.userId && p.userId !== 'OFFLINE') {
        const existing = userMap.get(p.userId)
        const betterName = (p.clientName && p.clientName !== "Client" && p.clientName !== "Unknown")
          ? p.clientName
          : (existing?.name || p.clientName || 'Unknown')

        userMap.set(p.userId, {
          id: p.userId,
          name: betterName,
          email: existing?.email || ''
        })
      }
    })

    const availableUsers = Array.from(userMap.values())

    return {
      estimates: estimates.map(e => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        project: e.project ? {
          ...e.project,
          createdAt: e.project.createdAt.toISOString(),
          updatedAt: e.project.updatedAt.toISOString(),
          subscriptionEndsAt: e.project.subscriptionEndsAt?.toISOString() || null
        } : null,
        service: e.service ? {
          ...e.service,
          createdAt: e.service.createdAt.toISOString(),
          updatedAt: e.service.updatedAt.toISOString()
        } : null
      })),
      services: services.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString()
      })),
      availableUsers
    }
  })

// 3. Mengubah Harga Quote Klien
export const updateQuotePriceFn = createServerFn({ method: 'POST' })
  .validator(updateQuotePriceSchema)
  .handler(async ({ data }) => {
    await requireBillingAdmin()
    const { estimateId, projectId, contextCurrency, activeRate: customRate } = data
    let newPrice = data.newPrice

    let activeRate = customRate || 0
    if (!activeRate) {
      const { paymentService } = await import("@/lib/server/payment-service")
      activeRate = await paymentService.getExchangeRate()
    }

    if (isNaN(newPrice)) throw new Error("Harga tidak valid")

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: { service: true }
    })

    if (!estimate) throw new Error("Quote tidak ditemukan")

    // Konversi mata uang dari context ke base currency layanan
    if (contextCurrency && activeRate && estimate.service && contextCurrency !== estimate.service.currency) {
      if (contextCurrency === 'USD' && estimate.service.currency === 'IDR') {
        newPrice = newPrice * activeRate
      } else if (contextCurrency === 'IDR' && estimate.service.currency === 'USD') {
        newPrice = newPrice / activeRate
      }
    }

    await prisma.estimate.update({
      where: { id: estimateId },
      data: {
        totalCost: newPrice,
        status: "pending_payment"
      }
    })

    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "pending_payment",
          totalAmount: newPrice
        }
      })
    }

    return { success: true }
  })

// 4. Membuat Quote Secara Manual
export const createManualQuoteFn = createServerFn({ method: 'POST' })
  .validator(createManualQuoteSchema)
  .handler(async ({ data }) => {
    await requireBillingAdmin()
    const { serviceId, userId, clientName, clientEmail, contextCurrency, activeRate: customRate } = data
    let amount = data.amount

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) throw new Error("Layanan tidak ditemukan")

    let activeRate = customRate || 0
    if (!activeRate) {
      const { paymentService } = await import("@/lib/server/payment-service")
      activeRate = await paymentService.getExchangeRate()
    }

    let finalClientName = clientName

    // Ambil nama profil Stack Auth jika tidak disediakan
    if (!finalClientName && userId !== 'OFFLINE') {
      try {
        const user = await hexclaveServerApp.getUser(userId)
        const fetchedName = user?.displayName || user?.primaryEmail || null
        if (fetchedName) finalClientName = fetchedName
      } catch (e) {
        console.error("Gagal mengambil nama user dari Stack Auth:", e)
      }
    }

    // Terapkan konversi mata uang
    if (contextCurrency && activeRate && contextCurrency !== service.currency) {
      if (contextCurrency === 'USD' && service.currency === 'IDR') {
        amount = amount * activeRate
      } else if (contextCurrency === 'IDR' && service.currency === 'USD') {
        amount = amount / activeRate
      }
    }

    const estimate = await prisma.estimate.create({
      data: {
        prompt: `Manual Quote for ${clientName}${clientEmail ? ` (${clientEmail})` : ''}`,
        title: `${service.title} Quote`,
        summary: clientEmail
          ? `Custom quote for ${clientName || 'Client'} (${clientEmail})`
          : `Custom quote generated by admin for ${clientName || 'Client'}`,
        screens: [],
        apis: [],
        totalHours: 0,
        totalCost: amount,
        complexity: "medium",
        status: "pending_offer",
        serviceId: service.id,
      }
    })

    await prisma.project.create({
      data: {
        userId: userId,
        title: service.title,
        clientName: finalClientName || (userId === 'OFFLINE' ? "Offline Client" : "Client"),
        status: "pending_offer",
        serviceId: service.id,
        totalAmount: amount,
        estimateId: estimate.id
      }
    })

    return { success: true }
  })

// 5. Menghapus Quote
export const deleteQuoteFn = createServerFn({ method: 'POST' })
  .validator(deleteQuoteSchema)
  .handler(async ({ data }) => {
    const { estimateId, userId } = data

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: { project: true }
    })

    if (!estimate) throw new Error("Quote tidak ditemukan")

    // Pengamanan jika dijalankan di client-side (hanya boleh hapus milik sendiri)
    if (userId && estimate.project?.userId !== userId) {
      throw new Error("Unauthorized: you can only delete your own quotes")
    }

    // Hapus project terkait terlebih dahulu karena batasan Foreign Key
    if (estimate.project) {
      await prisma.project.delete({
        where: { id: estimate.project.id }
      })
    }

    await prisma.estimate.delete({
      where: { id: estimateId }
    })

    return { success: true }
  })

// 6. Menghapus Pesanan Jasa (Order)
export const deleteOrderFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: orderId }) => {
    await requireBillingAdmin()
    await prisma.order.delete({
      where: { id: orderId }
    })
    return { success: true }
  })

// 7. Mengambil Subscriptions Retainer & SLA
export const getAdminFinanceSubscriptionsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireBillingAdmin()

    const projects = await prisma.project.findMany({
      where: {
        subscriptionStatus: { not: null }
      },
      include: {
        service: true,
        estimate: true
      },
      orderBy: { subscriptionEndsAt: 'asc' }
    })

    return projects.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      subscriptionEndsAt: p.subscriptionEndsAt?.toISOString() || null,
      service: p.service ? {
        ...p.service,
        createdAt: p.service.createdAt.toISOString(),
        updatedAt: p.service.updatedAt.toISOString()
      } : null,
      estimate: p.estimate ? {
        ...p.estimate,
        createdAt: p.estimate.createdAt.toISOString(),
        updatedAt: p.estimate.updatedAt.toISOString()
      } : null
    }))
  })

// 8. Membuat Invoice Perpanjangan (Renewal) Subscription
const generateRenewalInvoiceSchema = z.object({
  projectId: z.string(),
  amount: z.number(),
  summary: z.string()
})

export const generateRenewalInvoiceFn = createServerFn({ method: 'POST' })
  .validator(generateRenewalInvoiceSchema)
  .handler(async ({ data }) => {
    await requireBillingAdmin()
    const { projectId, amount, summary } = data

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { estimate: true, service: true }
    })

    if (!project) throw new Error("Proyek tidak ditemukan")

    const oldEstimate = project.estimate

    const newEstimate = await prisma.estimate.create({
      data: {
        title: `Renewal: ${project.title}`,
        prompt: "Subscription Renewal",
        summary: summary,
        screens: oldEstimate?.screens || [],
        apis: oldEstimate?.apis || [],
        totalHours: oldEstimate?.totalHours || 0,
        totalCost: amount,
        complexity: "Subscription Renewal",
        status: "pending_payment",
        serviceId: project.serviceId,
        userId: project.userId,
      }
    })

    await prisma.project.update({
      where: { id: projectId },
      data: {
        estimateId: newEstimate.id,
        subscriptionStatus: 'pending'
      }
    })

    return { success: true, estimateId: newEstimate.id }
  })

// 9. Mengambil Riwayat Transaksi Produk Digital
export const getAdminFinanceDigitalOrdersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireBillingAdmin()

    const orders = await prisma.digitalOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            type: true,
            slug: true
          }
        },
        license: {
          select: {
            key: true,
            status: true
          }
        }
      }
    })

    return orders.map(o => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      product: {
        ...o.product,
        name: o.product.name,
        type: o.product.type,
        slug: o.product.slug
      },
      license: o.license ? {
        key: o.license.key,
        status: o.license.status
      } : null
    }))
  })

// 10. Konfirmasi Pembayaran Produk Digital Secara Manual
export const confirmDigitalOrderFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: orderId }) => {
    await requireBillingAdmin()
    const { completeDigitalOrder } = await import('@/src/server/digital-orders')
    const result = await completeDigitalOrder(orderId, `MANUAL-${orderId}`, "manual_transfer")
    if (!result.success) throw new Error(result.error || "Gagal mengonfirmasi pesanan digital")
    return { success: true }
  })

// 11. Batalkan Pesanan Produk Digital
export const cancelDigitalOrderFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: orderId }) => {
    await requireBillingAdmin()
    await prisma.digitalOrder.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    })
    return { success: true }
  })

// 12. Hapus Pesanan Produk Digital
export const deleteDigitalOrderFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: orderId }) => {
    await requireBillingAdmin()
    await prisma.digitalOrder.delete({
      where: { id: orderId }
    })
    return { success: true }
  })
