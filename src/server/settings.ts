import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { isAdmin, getCurrentUser } from '@/lib/shared/auth-helpers'

// Helper untuk validasi bahwa user saat ini adalah admin
async function requireAdmin() {
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Unauthorized')
}

// 1. Server function untuk mengambil pengaturan sistem dengan input array key pengaturan
export const getSystemSettings = createServerFn({ method: 'GET' })
  .validator((data: string[]) => data)
  .handler(async ({ data }) => {
    const { getSystemSettings: getSystemSettingsImpl } = await import('@/lib/server/settings')
    return getSystemSettingsImpl(data)
  })

// 2. Server function untuk mengambil testimonial aktif berdasarkan jumlah limit
export const getActiveTestimonials = createServerFn({ method: 'GET' })
  .validator((data: number) => data)
  .handler(async ({ data }) => {
    const { getActiveTestimonials: getActiveTestimonialsImpl } = await import(
      '@/lib/server/testimonials'
    )
    return getActiveTestimonialsImpl(data)
  })

// 3. Server function untuk mengambil nama affiliate berdasarkan kode affiliate
export const getAffiliateName = createServerFn({ method: 'GET' })
  .validator((data: string) => data)
  .handler(async ({ data }) => {
    const { getAffiliateName: getAffiliateNameImpl } = await import('@/lib/server/affiliates')
    return getAffiliateNameImpl(data)
  })

// 4. Server function untuk mengambil data user yang terautentikasi (dibuat serializable)
export const getUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { hexclaveServerApp } = await import('@/lib/config/hexclave')
    const user = await hexclaveServerApp.getUser()
    if (!user) return null
    // Mengembalikan objek polos (plain object) agar serializable melewati server function boundary
    return {
      id: user.id,
      displayName: user.displayName || undefined,
      primaryEmail: user.primaryEmail || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
    }
  })

// 5. Server function untuk memperbarui pengaturan sistem (upsert)
export const updateSystemSettingFn = createServerFn({ method: 'POST' })
  .validator(z.object({ key: z.string(), value: z.string() }))
  .handler(async ({ data }) => {
    const { hexclaveServerApp } = await import('@/lib/config/hexclave')
    const user = await hexclaveServerApp.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const superAdminId = process.env.SUPER_ADMIN_ID
    if (!((user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId)) {
      throw new Error("Forbidden")
    }

    const { prisma } = await import('@/lib/config/db')
    await prisma.systemSetting.upsert({
      where: { key: data.key },
      update: { value: String(data.value) },
      create: { key: data.key, value: String(data.value) }
    })

    return { success: true }
  })

// 6. Server function untuk mengambil notifikasi user
export const getNotificationsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { hexclaveServerApp } = await import('@/lib/config/hexclave')
    const user = await hexclaveServerApp.getUser()
    if (!user) throw new Error("Unauthorized")

    const { prisma } = await import('@/lib/config/db')
    const list = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    return JSON.parse(JSON.stringify(list))
  })

// 7. Server function untuk menandai notifikasi sebagai terbaca
const markNotificationReadSchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional()
}).optional()

export const markNotificationReadFn = createServerFn({ method: 'POST' })
  .validator(markNotificationReadSchema)
  .handler(async ({ data }) => {
    const { hexclaveServerApp } = await import('@/lib/config/hexclave')
    const user = await hexclaveServerApp.getUser()
    if (!user) throw new Error("Unauthorized")

    const { prisma } = await import('@/lib/config/db')
    const id = data?.id
    const all = data?.all

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
      })
      return { success: true }
    }

    if (!id) throw new Error("ID required")

    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true }
    })
    return { success: true }
  })

// 8. Server function untuk mengambil konfigurasi payment gateway
export const getPaymentConfigsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()

    const { paymentGatewayService } = await import('@/lib/server/payment-gateway-service')
    const [midtrans, creem] = await Promise.all([
      paymentGatewayService.getMidtransConfig(),
      paymentGatewayService.getCreemConfig()
    ])
    return {
      midtrans: {
        ...midtrans,
        serverKey: midtrans.serverKey ? `***${midtrans.serverKey.slice(-4)}` : '',
        clientKey: midtrans.clientKey ? `***${midtrans.clientKey.slice(-4)}` : '',
      },
      creem: {
        ...creem,
        apiKey: creem.apiKey ? `***${creem.apiKey.slice(-4)}` : '',
      }
    }
  })

// 9. Server function untuk menyimpan konfigurasi payment gateway
const savePaymentConfigSchema = z.object({
  gateway: z.string(),
  config: z.record(z.string(), z.unknown())
})

export const savePaymentConfigFn = createServerFn({ method: 'POST' })
  .validator(savePaymentConfigSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const { gateway, config } = data
    if (!gateway || !config) throw new Error("Missing gateway or config")

    const { paymentGatewayService } = await import('@/lib/server/payment-gateway-service')

    if (gateway === "midtrans") {
      if (!config.serverKey || !config.clientKey || !config.merchantId) {
        throw new Error("Missing required Midtrans fields")
      }
      await paymentGatewayService.saveMidtransConfig({
        serverKey: config.serverKey as string,
        clientKey: config.clientKey as string,
        merchantId: config.merchantId as string,
        isProduction: (config.isProduction as boolean) || false,
        isActive: (config.isActive as boolean) || false
      })
      const { resetMidtransInstances } = await import('@/lib/integrations/midtrans')
      resetMidtransInstances()
      return { message: "Midtrans configuration saved successfully" }
    } else if (gateway === "creem") {
      if (!config.apiKey || !config.storeId) {
        throw new Error("Missing required Creem fields")
      }
      await paymentGatewayService.saveCreemConfig({
        apiKey: config.apiKey as string,
        storeId: config.storeId as string,
        isProduction: (config.isProduction as boolean) || false,
        isActive: (config.isActive as boolean) || false
      })
      const { resetCreemInstance } = await import('@/lib/integrations/creem')
      resetCreemInstance()
      return { message: "Creem configuration saved successfully" }
    } else {
      throw new Error("Invalid gateway. Must be 'midtrans' or 'creem'")
    }
  })

// 10. Server function untuk menyimpan informasi kontak / profil agensi
const saveContactSettingsSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  address: z.string().optional(),
  agencyName: z.string().optional(),
  companyName: z.string().optional(),
  logoUrl: z.string().optional(),
  logoDisplayMode: z.string().optional(),
  servicesTitle: z.string().optional(),
  servicesSubtitle: z.string().optional(),
  hours: z.string().optional()
})

export const saveContactSettingsFn = createServerFn({ method: 'POST' })
  .validator(saveContactSettingsSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const CONTACT_EMAIL_KEY = "CONTACT_EMAIL"
    const CONTACT_PHONE_KEY = "CONTACT_PHONE"
    const CONTACT_TELEGRAM_KEY = "CONTACT_TELEGRAM"
    const CONTACT_ADDRESS_KEY = "CONTACT_ADDRESS"
    const AGENCY_NAME_KEY = "AGENCY_NAME"
    const COMPANY_NAME_KEY = "COMPANY_NAME"
    const AGENCY_LOGO_KEY = "AGENCY_LOGO"
    const AGENCY_LOGO_DISPLAY_KEY = "AGENCY_LOGO_DISPLAY"
    const SERVICES_TITLE_KEY = "SERVICES_TITLE"
    const SERVICES_SUBTITLE_KEY = "SERVICES_SUBTITLE"
    const CONTACT_HOURS_KEY = "CONTACT_HOURS"

    const { prisma } = await import('@/lib/config/db')

    const updates = [
      prisma.systemSetting.upsert({ where: { key: CONTACT_EMAIL_KEY }, update: { value: data.email || "" }, create: { key: CONTACT_EMAIL_KEY, value: data.email || "" } }),
      prisma.systemSetting.upsert({ where: { key: CONTACT_PHONE_KEY }, update: { value: data.phone || "" }, create: { key: CONTACT_PHONE_KEY, value: data.phone || "" } }),
      prisma.systemSetting.upsert({ where: { key: CONTACT_TELEGRAM_KEY }, update: { value: data.telegram || "" }, create: { key: CONTACT_TELEGRAM_KEY, value: data.telegram || "" } }),
      prisma.systemSetting.upsert({ where: { key: CONTACT_ADDRESS_KEY }, update: { value: data.address || "" }, create: { key: CONTACT_ADDRESS_KEY, value: data.address || "" } }),
      prisma.systemSetting.upsert({ where: { key: AGENCY_NAME_KEY }, update: { value: data.agencyName || "" }, create: { key: AGENCY_NAME_KEY, value: data.agencyName || "" } }),
      prisma.systemSetting.upsert({ where: { key: COMPANY_NAME_KEY }, update: { value: data.companyName || "" }, create: { key: COMPANY_NAME_KEY, value: data.companyName || "" } }),
      prisma.systemSetting.upsert({ where: { key: AGENCY_LOGO_KEY }, update: { value: data.logoUrl || "" }, create: { key: AGENCY_LOGO_KEY, value: data.logoUrl || "" } }),
      prisma.systemSetting.upsert({ where: { key: AGENCY_LOGO_DISPLAY_KEY }, update: { value: data.logoDisplayMode || "both" }, create: { key: AGENCY_LOGO_DISPLAY_KEY, value: data.logoDisplayMode || "both" } }),
      prisma.systemSetting.upsert({ where: { key: SERVICES_TITLE_KEY }, update: { value: data.servicesTitle || "" }, create: { key: SERVICES_TITLE_KEY, value: data.servicesTitle || "" } }),
      prisma.systemSetting.upsert({ where: { key: SERVICES_SUBTITLE_KEY }, update: { value: data.servicesSubtitle || "" }, create: { key: SERVICES_SUBTITLE_KEY, value: data.servicesSubtitle || "" } }),
      prisma.systemSetting.upsert({ where: { key: CONTACT_HOURS_KEY }, update: { value: data.hours || "" }, create: { key: CONTACT_HOURS_KEY, value: data.hours || "" } }),
    ]

    await prisma.$transaction(updates)
    return { success: true }
  })

// 11. Server function untuk menyimpan konfigurasi Resend email
const saveResendConfigSchema = z.object({
  resendKey: z.string().optional(),
  adminEmail: z.string().optional()
})

export const saveResendConfigFn = createServerFn({ method: 'POST' })
  .validator(saveResendConfigSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const { prisma } = await import('@/lib/config/db')
    const { resendKey, adminEmail } = data

    if (resendKey !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "RESEND_API_KEY" },
        update: { value: resendKey, description: "API Key for Resend email service" },
        create: { key: "RESEND_API_KEY", value: resendKey, description: "API Key for Resend email service" }
      })
    }
    if (adminEmail !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "ADMIN_EMAIL_TARGET" },
        update: { value: adminEmail, description: "Target email address for contact form submissions" },
        create: { key: "ADMIN_EMAIL_TARGET", value: adminEmail, description: "Target email address for contact form submissions" }
      })
    }
    return { success: true }
  })

// Server function untuk mengambil SEO halaman berdasarkan path secara aman dari client bundle
export const getPageSeoFn = createServerFn({ method: 'GET' })
  .validator((path: string) => path)
  .handler(async ({ data: path }) => {
    const { getPageSeo } = await import('@/lib/server/seo')
    const seo = await getPageSeo(path)
    return JSON.parse(JSON.stringify(seo))
  })

