import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { z } from 'zod'
import { getBonuses, createBonus, deleteBonus, toggleBonusStatus, getCoupons, createCoupon, deleteCoupon, getSubscribers, deleteSubscriber, getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/lib/server/marketing"
import { getLeads, deleteLead } from "@/lib/server/leads"
import { getPopUps, createPopUp, updatePopUp, deletePopUp, togglePopUpStatus } from "@/lib/server/popups"

// Helper untuk validasi akses admin
async function requireAdmin() {
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Unauthorized')
}

// ─── 1. BONUSES ───
export const getBonusesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await getBonuses()
  })

const createBonusSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  value: z.string().optional(),
  icon: z.string().optional(),
  appliesTo: z.array(z.string()).optional()
})

export const createBonusFn = createServerFn({ method: 'POST' })
  .validator(createBonusSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return await createBonus(data)
  })

export const deleteBonusFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await deleteBonus(id)
    return { success: true }
  })

export const toggleBonusStatusFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), isActive: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    return await toggleBonusStatus(data.id, data.isActive)
  })

// ─── 2. COUPONS ───
export const getCouponsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await getCoupons()
  })

const createCouponSchema = z.object({
  code: z.string(),
  discountType: z.string(),
  discountValue: z.number(),
  maxUses: z.number().optional(),
  expiresAt: z.string().optional(),
  appliesTo: z.array(z.string()).optional()
})

export const createCouponFn = createServerFn({ method: 'POST' })
  .validator(createCouponSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return await createCoupon({
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    })
  })

export const deleteCouponFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await deleteCoupon(id)
    return { success: true }
  })

// ─── 3. LEADS ───
export const getLeadsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await getLeads()
  })

export const deleteLeadFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await deleteLead(id)
    return { success: true }
  })

// ─── 4. POPUPS ───
export const getPopUpsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await getPopUps()
  })

const createPopUpSchema = z.object({
  name: z.string(),
  title: z.string(),
  content: z.string(),
  triggerType: z.string(),
  triggerDelay: z.number().optional(),
  scrollPercentage: z.number().optional(),
  targetPages: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isNewsletterForm: z.boolean().optional(),
  imageUrl: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  couponCode: z.string().optional()
})

export const createPopUpFn = createServerFn({ method: 'POST' })
  .validator(createPopUpSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return await createPopUp(data)
  })

export const updatePopUpFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), data: createPopUpSchema.partial() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    return await updatePopUp(data.id, data.data)
  })

export const deletePopUpFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await deletePopUp(id)
    return { success: true }
  })

export const togglePopUpStatusFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), isActive: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    return await togglePopUpStatus(data.id, data.isActive)
  })

// ─── 5. SUBSCRIBERS ───
export const getSubscribersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    return await getSubscribers()
  })

export const deleteSubscriberFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await deleteSubscriber(id)
    return { success: true }
  })

// ─── 6. PUSH NOTIFICATIONS ───
const broadcastPushSchema = z.object({
  title: z.string(),
  body: z.string(),
  url: z.string().optional(),
  targetEndpoints: z.array(z.string()).optional()
})

export const broadcastPushFn = createServerFn({ method: 'POST' })
  .validator(broadcastPushSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const { broadcastPushNotification } = await import("@/lib/server/push")
    const { title, body: content, url, targetEndpoints } = data

    const where = targetEndpoints && targetEndpoints.length > 0
      ? { endpoint: { in: targetEndpoints } }
      : {}

    const subscriptions = await prisma.pushSubscription.findMany({ where })
    if (subscriptions.length === 0) {
      return { success: true, data: { count: 0, message: "No subscribers found" } }
    }

    const pushSubs = subscriptions.map(s => ({
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth }
    }))

    const result = await broadcastPushNotification(pushSubs, {
      title,
      body: content,
      url: url || process.env.NEXT_PUBLIC_APP_URL,
    })

    return { success: true, data: result }
  })

export const getPushStatsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const totalSubscribers = await prisma.pushSubscription.count()
    return {
      success: true,
      data: { subscribers: totalSubscribers, engagement: 0 }
    }
  })

// ─── 7. PROMOTIONS ───
export const getAdminPromotionsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const raw = await getPromotions(false)
    return JSON.parse(JSON.stringify(raw))
  })

const createPromotionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  couponCode: z.string().optional(),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export const createPromotionFn = createServerFn({ method: 'POST' })
  .validator(createPromotionSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const promo = await createPromotion({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    })
    return JSON.parse(JSON.stringify(promo))
  })

export const updatePromotionFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), data: createPromotionSchema.partial() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const promo = await updatePromotion(data.id, {
      ...data.data,
      startDate: data.data.startDate ? new Date(data.data.startDate) : undefined,
      endDate: data.data.endDate ? new Date(data.data.endDate) : undefined,
    })
    return JSON.parse(JSON.stringify(promo))
  })

export const deletePromotionFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await deletePromotion(id)
    return { success: true }
  })

// ─── 8. ASSETS ───
export const getAdminAssetsFn = createServerFn({ method: 'GET' })
  .validator(z.object({ page: z.number().optional(), limit: z.number().optional(), type: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    await requireAdmin()
    const page = data?.page || 1
    const limit = data?.limit || 100
    const type = data?.type

    const safeLimit = Math.min(Math.max(limit, 1), 100)
    const skip = (page - 1) * safeLimit

    const raw = await prisma.marketingAsset.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: skip,
    })
    return JSON.parse(JSON.stringify(raw))
  })

const createAssetSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
})

export const createAssetFn = createServerFn({ method: 'POST' })
  .validator(createAssetSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const asset = await prisma.marketingAsset.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        category: data.category,
        metadata: data.metadata || {}
      }
    })
    return JSON.parse(JSON.stringify(asset))
  })

export const updateAssetFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), data: createAssetSchema.partial().and(z.object({ isActive: z.boolean().optional() })) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const { metadata, ...rest } = data.data
    const asset = await prisma.marketingAsset.update({
      where: { id: data.id },
      data: {
        ...rest,
        ...(metadata ? { metadata } : {})
      }
    })
    return JSON.parse(JSON.stringify(asset))
  })

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await prisma.marketingAsset.delete({ where: { id } })
    return { success: true }
  })

