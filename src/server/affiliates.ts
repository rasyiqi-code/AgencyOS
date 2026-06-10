import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin, getCurrentUser } from '@/lib/shared/auth-helpers'
import { getSystemSettings } from '@/lib/server/settings'
import { z } from 'zod'

// Helper untuk validasi bahwa user saat ini adalah admin/super-admin
async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const superAdminId = process.env.SUPER_ADMIN_ID
  const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId
  
  if (!isSuperAdmin && !(await isAdmin())) {
    throw new Error('Forbidden')
  }
  return user
}

// Serializer untuk objek prisma (terutama Date)
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

// 1. Mengambil Daftar Mitra Afiliasi (Affiliates) beserta statistiknya
export const getAffiliatesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()

    try {
      const aggregates = await prisma.affiliateProfile.aggregate({
        _sum: { paidEarnings: true, totalEarnings: true },
        _count: { id: true }
      })

      const totalPaid = aggregates._sum.paidEarnings || 0
      const totalEarnings = aggregates._sum.totalEarnings || 0
      const pendingPayouts = totalEarnings - totalPaid
      const totalAffiliates = aggregates._count.id || 0

      const affiliates = await prisma.affiliateProfile.findMany({
        include: {
          _count: { select: { referrals: true, commissions: true } }
        },
        orderBy: { createdAt: 'desc' },
      })

      const settings = await getSystemSettings(["affiliate_default_commission_rate", "RESEND_API_KEY"])
      const defaultRate = parseFloat(settings.find((s: { key: string; value: string }) => s.key === "affiliate_default_commission_rate")?.value || "10")
      const resendKeyRaw = settings.find((s: { key: string; value: string }) => s.key === "RESEND_API_KEY")?.value
      const resendApiKey = resendKeyRaw ? `${resendKeyRaw.substring(0, 4)}...${resendKeyRaw.substring(resendKeyRaw.length - 4)}` : ""

      return {
        success: true,
        data: serialize({ 
          affiliates, 
          stats: { totalAffiliates, totalPaid, pendingPayouts, totalEarnings }, 
          defaultRate, 
          resendApiKey 
        })
      }
    } catch (error) {
      console.error("Admin Affiliates Server Error:", error)
      return { success: false, error: "Internal Server Error" }
    }
  })

// Schema untuk update mitra afiliasi
const updateAffiliateSchema = z.object({
  id: z.string(),
  commissionRate: z.number().optional(),
  status: z.string().optional()
})

// 2. Memperbarui Komisi / Status Mitra Afiliasi
export const updateAffiliateFn = createServerFn({ method: 'POST' })
  .validator(updateAffiliateSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const { id, commissionRate, status } = data

    try {
      const updateData: Record<string, unknown> = {}

      if (commissionRate !== undefined) {
        if (commissionRate < 0 || commissionRate > 100) {
          throw new Error("Persentase komisi harus di antara 0-100")
        }
        updateData.commissionRate = commissionRate
      }

      if (status !== undefined) {
        const validStatuses = ["pending", "active", "suspended"]
        if (!validStatuses.includes(status)) {
          throw new Error(`Status tidak valid`)
        }
        updateData.status = status
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error("Tidak ada data untuk diperbarui")
      }

      const updated = await prisma.affiliateProfile.update({
        where: { id },
        data: updateData
      })

      return { success: true, data: serialize(updated) }
    } catch (error) {
      console.error("Admin Affiliate Update Server Error:", error)
      return { success: false, error: (error as Error).message || "Internal Server Error" }
    }
  })

// 3. Mengambil Pengajuan Pencairan Komisi (Payout Requests)
export const getPayoutRequestsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()

    try {
      const requests = await prisma.payoutRequest.findMany({
        include: {
          affiliate: { select: { name: true, email: true, referralCode: true } },
          squad: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      return { success: true, data: serialize({ requests }) }
    } catch (error) {
      console.error("Admin Payout Requests Server Error:", error)
      return { success: false, error: "Internal Server Error" }
    }
  })

// Schema untuk memproses pencairan
const processPayoutSchema = z.object({
  requestId: z.string(),
  action: z.enum(["approved", "rejected"]),
  notes: z.string().optional()
})

// 4. Memproses Pengajuan Pencairan Komisi (Approve/Reject)
export const processPayoutFn = createServerFn({ method: 'POST' })
  .validator(processPayoutSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const { requestId, action, notes } = data

    try {
      const payoutReq = await prisma.payoutRequest.findUnique({
        where: { id: requestId },
        include: { affiliate: true, squad: true }
      })

      if (!payoutReq) {
        throw new Error("Pengajuan pencairan tidak ditemukan")
      }

      if (payoutReq.status !== "pending") {
        throw new Error("Pengajuan ini sudah pernah diproses sebelumnya")
      }

      // Jika diajukan oleh Tim Squad
      if (payoutReq.squadId && payoutReq.squad) {
        if (action === "approved") {
          await prisma.payoutRequest.update({
            where: { id: requestId },
            data: { status: "approved", notes, processedAt: new Date() }
          })
        } else {
          await prisma.payoutRequest.update({
            where: { id: requestId },
            data: { status: "rejected", notes, processedAt: new Date() }
          })
        }
        return { success: true, action }
      }

      // Jika diajukan oleh Mitra Afiliasi
      if (payoutReq.affiliateId && payoutReq.affiliate) {
        const { sendPayoutApprovedEmail, sendPayoutRejectedEmail } = await import("@/lib/email/affiliate-emails")

        if (action === "approved") {
          await prisma.$transaction([
            prisma.payoutRequest.update({
              where: { id: requestId },
              data: { status: "approved", notes, processedAt: new Date() }
            }),
            prisma.affiliateProfile.update({
              where: { id: payoutReq.affiliateId },
              data: { paidEarnings: { increment: payoutReq.amount } }
            }),
            prisma.commissionLog.updateMany({
              where: {
                affiliateId: payoutReq.affiliateId,
                status: "pending",
                createdAt: { lte: payoutReq.createdAt }
              },
              data: { status: "paid", paidAt: new Date() }
            })
          ])

          sendPayoutApprovedEmail(payoutReq.affiliate.email, payoutReq.affiliate.name, payoutReq.amount)
            .catch(err => console.error("Gagal mengirim email persetujuan pencairan:", err))
        } else {
          await prisma.payoutRequest.update({
            where: { id: requestId },
            data: { status: "rejected", notes, processedAt: new Date() }
          })

          sendPayoutRejectedEmail(payoutReq.affiliate.email, payoutReq.affiliate.name, payoutReq.amount, notes || "")
            .catch(err => console.error("Gagal mengirim email penolakan pencairan:", err))
        }
      }

      return { success: true, action }
    } catch (error) {
      console.error("Admin Payout Processing Server Error:", error)
      return { success: false, error: (error as Error).message || "Internal Server Error" }
    }
  })

// 7. Mengambil daftar developer tim (Squad Developers)
export const getSquadDevelopersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()

    const profiles = await prisma.squadProfile.findMany({
      orderBy: { name: 'asc' },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true
      }
    })

    const developers = profiles.map(p => ({
      id: p.userId,
      displayName: `${p.name} (${p.role})`,
      primaryEmail: p.email,
    }))

    return { success: true, data: developers }
  })

// 8. Memperbarui informasi rekening bank afiliasi
const updateBankDetailsSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string()
})

export const updateBankDetailsFn = createServerFn({ method: 'POST' })
  .validator(updateBankDetailsSchema)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { bankName, accountNumber, accountHolder } = data
    if (!bankName || !accountNumber || !accountHolder) throw new Error("Missing required fields")

    const bankInfo = { bankName, accountNumber, accountHolder }

    await prisma.affiliateProfile.update({
      where: { userId: user.id },
      data: { bankInfo }
    })

    return { success: true, data: bankInfo }
  })

export const getAffiliateDashboardData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
      include: {
        _count: { select: { referrals: true, commissions: true } },
        commissions: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    })

    const lifetimeTotal = await prisma.commissionLog.aggregate({
      where: { affiliateId: profile?.id },
      _sum: { amount: true },
    })

    const products = await prisma.product.findMany({ where: { isActive: true } })
    const services = await prisma.service.findMany({ where: { isActive: true } })

    return {
      profile: profile
        ? {
            ...profile,
            createdAt: profile.createdAt.toISOString(),
            commissions: profile.commissions.map(c => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            })),
          }
        : null,
      lifetimeTotal: lifetimeTotal._sum.amount ?? 0,
      products: products.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      services: services.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    }
  },
)

