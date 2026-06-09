import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { z } from 'zod'

import { getCookie } from '@tanstack/react-start/server'

// Helper untuk otentikasi client
async function requireClient() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// Helper untuk mendeteksi locale dari cookie
function getLocale() {
  return getCookie('NEXT_LOCALE') || 'en'
}

// 1. Ambil data billing client
export const getClientBillingDataFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const user = await requireClient()
      const locale = getLocale()

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
  .handler(async () => {
    try {
      const user = await requireClient()
      const locale = getLocale()
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
  .handler(async ({ data: { q } }) => {
    try {
      const user = await requireClient()
      const locale = getLocale()

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
  .handler(async () => {
    try {
      await requireClient()
      const locale = getLocale()

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

// 6. Membuat invoice perpanjangan langganan secara otomatis
export const clientGenerateRenewalInvoiceFn = createServerFn({ method: 'POST' })
  .validator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    try {
      const user = await requireClient()

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { estimate: true, service: true }
      })

      if (!project || project.userId !== user.id) {
        throw new Error("Project not found or unauthorized")
      }

      if (project.estimate?.status === "pending_payment" && project.estimate?.complexity === "Subscription Renewal") {
        return { success: true, estimateId: project.estimate.id }
      }

      const oldEstimate = project.estimate

      let amount = 0
      if (project.service?.interval === 'monthly' || project.service?.interval === 'yearly') {
        amount += project.service.price
      }

      const summaryText = oldEstimate?.summary || project.description || ""
      const lines = summaryText.split('\n')
      lines.forEach(line => {
        if (line.includes('Monthly') || line.includes('Yearly')) {
          const match = line.match(/\(\D*([\d.]+)\s+(Monthly|Yearly)\)/i)
          if (match && match[1]) {
            amount += parseFloat(match[1])
          }
        }
      })

      if (amount === 0 && project.totalAmount > 0) {
        amount = project.totalAmount
      }

      const newEstimate = await prisma.estimate.create({
        data: {
          title: `Renewal: ${project.title}`,
          prompt: "Subscription Renewal",
          summary: "Otomatis dibuat oleh sistem untuk perpanjangan langganan. " + (project.description ? "\nTermasuk: \n" + project.description : ""),
          screens: (oldEstimate?.screens || []) as any,
          apis: (oldEstimate?.apis || []) as any,
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
    } catch (error) {
      console.error("Failed to generate renewal invoice:", error)
      throw error
    }
  })

const createFromBriefSchema = z.object({
  title: z.string().min(1, "Title is required"),
  brief: z.string().min(1, "Brief is required"),
})

// 7. Membuat proyek baru dari brief konsultasi AI
export const createProjectFromBriefFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createFromBriefSchema.parse(data))
  .handler(async ({ data: body }) => {
    const user = await requireClient()
    try {
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          title: body.title,
          description: "Project started from AI Consultation",
          spec: body.brief,
          status: "queue",
          briefs: {
            create: {
              content: body.brief,
            },
          },
        },
      })
      return { success: true, data: project }
    } catch (error) {
      console.error("Project creation error:", error)
      throw new Error("Internal Server Error")
    }
  })



