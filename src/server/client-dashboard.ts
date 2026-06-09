import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { z } from 'zod'

// Helper untuk otentikasi client
async function requireClient() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// Helper untuk mendeteksi locale dari cookie
function getLocaleFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/NEXT_LOCALE=([^;]+)/)
  return match ? match[1] : 'en'
}

// 1. Ambil data billing client
export const getClientBillingDataFn = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    try {
      const user = await requireClient()
      const locale = getLocaleFromRequest(request)

      const orders = await prisma.order.findMany({
        where: {
          userId: user.id,
          project: {
            status: { notIn: ['draft', 'pending', 'pending_offer'] }
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              title: true,
              description: true,
              invoiceId: true,
              estimateId: true,
              paymentStatus: true
            }
          }
        }
      })

      const unpaidEstimates = await prisma.estimate.findMany({
        where: {
          project: { userId: user.id },
          complexity: "Subscription Renewal",
          status: "pending_payment"
        },
        include: { service: true },
        orderBy: { createdAt: 'desc' }
      })

      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const projectsNeedingRenewal = await prisma.project.findMany({
        where: {
          userId: user.id,
          subscriptionStatus: { not: null },
          subscriptionEndsAt: { lte: nextWeek },
          estimate: {
            status: { not: "pending_payment" }
          }
        },
        include: { service: true }
      })

      return {
        success: true,
        orders: JSON.parse(JSON.stringify(orders)),
        unpaidEstimates: JSON.parse(JSON.stringify(unpaidEstimates)),
        projectsNeedingRenewal: JSON.parse(JSON.stringify(projectsNeedingRenewal)),
        locale
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        orders: [],
        unpaidEstimates: [],
        projectsNeedingRenewal: [],
        locale: 'en'
      }
    }
  })

// 2. Ambil data quotes client
export const getClientQuotesFn = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    try {
      const user = await requireClient()
      const locale = getLocaleFromRequest(request)
      const estimates = await prisma.estimate.findMany({
        where: {
          project: {
            userId: user.id
          }
        },
        include: {
          service: true,
          project: true,
        },
        orderBy: { createdAt: "desc" }
      })

      return {
        success: true,
        estimates: JSON.parse(JSON.stringify(estimates)),
        locale
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, estimates: [], locale: 'en' }
    }
  })

// 3. Ambil data missions client
export const getClientMissionsFn = createServerFn({ method: 'GET' })
  .validator(z.object({ q: z.string().optional() }))
  .handler(async ({ data: { q }, request }) => {
    try {
      const user = await requireClient()
      const locale = getLocaleFromRequest(request)

      const allProjects = await prisma.project.findMany({
        where: {
          userId: user.id,
          status: { in: ['queue', 'dev', 'review', 'done'] },
          ...(q ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          } : {})
        },
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          estimate: {
            include: { service: true }
          },
          briefs: true,
          dailyLogs: true,
          feedback: true
        }
      })

      return {
        success: true,
        allProjects: JSON.parse(JSON.stringify(allProjects)),
        locale
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, allProjects: [], locale: 'en' }
    }
  })

// 4. Ambil data services client
export const getClientServicesFn = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    try {
      await requireClient()
      const locale = getLocaleFromRequest(request)

      const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      })

      const processedServices = services.map((s) => ({
        ...s,
        features: s.features as unknown,
        features_id: s.features_id as unknown
      }))

      return {
        success: true,
        processedServices: JSON.parse(JSON.stringify(processedServices)),
        locale
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, processedServices: [], locale: 'en' }
    }
  })

// 5. Ambil data settings client
export const getClientSettingsDataFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const user = await requireClient()
      return {
        success: true,
        user: {
          displayName: user.displayName,
          primaryEmail: user.primaryEmail
        }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, user: null }
    }
  })

