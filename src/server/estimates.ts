import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { processAffiliateCommissionsBulk } from '@/lib/affiliate/commission'
import { notifyPaymentSuccess } from '@/lib/email/admin-notifications'
import { sendPaymentSuccessEmail, sendOrderCancelledEmail } from '@/lib/email/client-notifications'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { ScreenItemSchema, ApiItemSchema, type ScreenItem, type ApiItem } from '@/lib/shared/types'

// Memastikan user adalah admin sebelum menjalankan tindakan finansial / estimasi
async function requireAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// 1. Konfirmasi Pembayaran (confirmPayment)
export const confirmPaymentFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()

    const targetId = id
    const isOrderId = targetId.startsWith('ORDER-')

    try {
      let estimateId = isOrderId ? null : targetId
      let orderFromId = null

      if (isOrderId) {
        orderFromId = await prisma.order.findUnique({
          where: { id: targetId },
          include: {
            project: { include: { estimate: true } }
          }
        })
        estimateId = orderFromId?.project?.estimate?.id || null
      }

      const estimate = estimateId ? await prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
          project: { include: { orders: true } }
        }
      }) : null

      const project = estimate?.project || orderFromId?.project

      if (!project && !estimate) {
        return { error: "Transaksi/Invoice tidak ditemukan" }
      }

      const pendingOrders = isOrderId && orderFromId
        ? [orderFromId]
        : ((project as any)?.orders || []).filter((o: any) =>
          o.status === 'pending' || o.status === 'waiting_verification'
        )

      let paymentType = isOrderId && orderFromId ? (orderFromId.type || 'FULL') : 'FULL'
      let amountPaid = isOrderId && orderFromId ? orderFromId.amount : (project?.totalAmount || 0)

      if (!isOrderId && pendingOrders.length > 0) {
        const targetOrder = pendingOrders[0]
        paymentType = targetOrder.type
        const orderRate = targetOrder.exchangeRate || 1
        amountPaid = targetOrder.currency === 'IDR' && targetOrder.amount > 5000
          ? targetOrder.amount / orderRate
          : targetOrder.amount
      }

      const totalAmount = project?.totalAmount || estimate?.totalCost || 0

      let newProjectPaymentStatus = 'PAID'
      const newProjectStatus = 'queue'

      if (paymentType === 'DP') {
        newProjectPaymentStatus = 'PARTIAL'
      }

      if (paymentType !== 'DP' && estimateId) {
        await prisma.estimate.update({
          where: { id: estimateId },
          data: { status: 'paid' }
        })
      }

      if (project) {
        const currentPaid = project.paidAmount || 0
        const finalPaidAmount = paymentType === 'DP' ? currentPaid + amountPaid : totalAmount

        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: newProjectStatus,
            paymentStatus: newProjectPaymentStatus,
            paidAmount: finalPaidAmount
          }
        })

        if (pendingOrders.length > 0) {
          await prisma.order.updateMany({
            where: { id: { in: pendingOrders.map((o: any) => o.id) } },
            data: { status: 'paid' }
          })

          await processAffiliateCommissionsBulk(pendingOrders)
        }

        try {
          let customerEmail = ""
          let customerName = "Client"

          if (project.userId !== 'OFFLINE') {
            const stackUser = await hexclaveServerApp.getUser(project.userId)
            if (stackUser) {
              customerEmail = stackUser.primaryEmail || ""
              customerName = stackUser.displayName || customerEmail.split('@')[0] || "Client"
            }
          } else if (project.clientName) {
            customerName = project.clientName
          }

          if (customerEmail) {
            sendPaymentSuccessEmail({
              to: customerEmail,
              customerName,
              orderId: targetId,
              amount: amountPaid,
              productName: project.title || (estimate?.title) || "Service"
            }).catch(err => console.error("Client notification error:", err))
          }

          notifyPaymentSuccess({
            orderId: targetId,
            amount: amountPaid,
            customerName,
            type: "SERVICE"
          }).catch(err => console.error("Admin notification error:", err))
        } catch (err) {
          console.error("Gagal mengirim notifikasi untuk konfirmasi pembayaran:", err)
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Confirm Order Error:", error)
      return { error: "Internal Server Error" }
    }
  })

// 2. Batalkan Estimasi (cancelEstimate)
export const cancelEstimateFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()

    const targetId = id
    const isOrderId = targetId.startsWith('ORDER-')

    try {
      let estimateId = isOrderId ? null : targetId
      let orderFromId = null

      if (isOrderId) {
        orderFromId = await prisma.order.findUnique({
          where: { id: targetId },
          include: {
            project: { include: { estimate: true, orders: true } }
          }
        })
        estimateId = orderFromId?.project?.estimate?.id || null
      }

      const estimate = estimateId ? await prisma.estimate.findUnique({
        where: { id: estimateId },
        include: {
          project: { include: { orders: true } }
        }
      }) : null

      const project = estimate?.project || orderFromId?.project

      if (!project && !estimate && !orderFromId) {
        return { error: "Transaksi/Invoice tidak ditemukan" }
      }

      const updates: Prisma.PrismaPromise<unknown>[] = []

      if (orderFromId) {
        updates.push(
          prisma.order.update({
            where: { id: orderFromId.id },
            data: { status: 'cancelled' }
          })
        )
      }

      if (estimateId) {
        updates.push(
          prisma.estimate.update({
            where: { id: estimateId },
            data: { status: 'cancelled' }
          })
        )
      }

      if (project) {
        updates.push(
          prisma.project.update({
            where: { id: project.id },
            data: { status: 'cancelled', paymentStatus: 'UNPAID' }
          })
        )

        const projectOrders = (project as any).orders || []
        const pendingOrderIds = projectOrders
          .filter((o: any) => o.status === 'pending' || o.status === 'waiting_verification')
          .map((o: any) => o.id)

        if (pendingOrderIds.length > 0) {
          updates.push(
            prisma.order.updateMany({
              where: { id: { in: pendingOrderIds } },
              data: { status: 'cancelled' }
            })
          )
        }
      }

      await prisma.$transaction(updates)

      if (project) {
        try {
          let customerEmail = ""
          let customerName = "Client"

          if (project.userId !== 'OFFLINE') {
            const stackUser = await hexclaveServerApp.getUser(project.userId)
            if (stackUser) {
              customerEmail = stackUser.primaryEmail || ""
              customerName = stackUser.displayName || customerEmail.split('@')[0] || "Client"
            }
          } else if (project.clientName) {
            customerName = project.clientName
          }

          if (customerEmail) {
            sendOrderCancelledEmail({
              to: customerEmail,
              customerName,
              orderId: targetId,
              productName: project.title || estimate?.title || "Service"
            }).catch(err => console.error("Cancellation notification error:", err))
          }
        } catch (err) {
          console.error("Gagal mengirim email pembatalan:", err)
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Cancel Order Error:", error)
      return { error: "Internal Server Error" }
    }
  })

// 3. Perbarui Estimasi (updateEstimate)
const UpdateBodySchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  additions: z.object({
    screens: z.array(ScreenItemSchema).optional(),
    apis: z.array(ApiItemSchema).optional(),
  }).optional(),
  removals: z.object({
    screens: z.array(z.string()).optional(),
    apis: z.array(z.string()).optional(),
  }).optional(),
  screens: z.array(ScreenItemSchema).optional(),
  apis: z.array(ApiItemSchema).optional(),
})

export const updateEstimateFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    estimateId: z.string(),
    body: UpdateBodySchema
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const { estimateId, body } = data

    try {
      const { additions, removals, summary, title } = body

      const currentEstimate = await prisma.estimate.findUnique({
        where: { id: estimateId }
      })

      if (!currentEstimate) return { error: "Estimasi tidak ditemukan" }

      let existingScreens = (currentEstimate.screens as unknown as ScreenItem[]) || []
      let existingApis = (currentEstimate.apis as unknown as ApiItem[]) || []

      if (removals) {
        if (removals.screens?.length) {
          existingScreens = existingScreens.filter(s => !removals.screens?.includes(s.title))
        }
        if (removals.apis?.length) {
          existingApis = existingApis.filter(a => !removals.apis?.includes(a.title))
        }
      }

      const newScreens = additions?.screens || body.screens || []
      const newApis = additions?.apis || body.apis || []

      const mergedScreens = [...existingScreens, ...newScreens]
      const mergedApis = [...existingApis, ...newApis]

      const HOURLY_RATE = 12

      const screensHours = mergedScreens.reduce((acc, item) => acc + (item.hours || 0), 0)
      const apisHours = mergedApis.reduce((acc, item) => acc + (item.hours || 0), 0)
      const totalHours = screensHours + apisHours
      const totalCost = totalHours * HOURLY_RATE

      const updatedEstimate = await prisma.estimate.update({
        where: { id: estimateId },
        data: {
          title: title || undefined,
          summary: summary || undefined,
          screens: mergedScreens as unknown as Prisma.InputJsonValue,
          apis: mergedApis as unknown as Prisma.InputJsonValue,
          totalHours,
          totalCost,
        },
      })

      return { success: true, data: JSON.parse(JSON.stringify(updatedEstimate)) }
    } catch (error) {
      console.error("Error updating estimate:", error)
      return { error: "Gagal memperbarui estimasi" }
    }
  })

const scheduleEmailSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  estimateTitle: z.string().optional(),
  totalCost: z.number().optional(),
  totalHours: z.number().optional(),
  link: z.string().optional(),
})

// 4. Menjadwalkan pengiriman email leads/konsultasi ke admin
export const scheduleEmailFn = createServerFn({ method: 'POST' })
  .validator(scheduleEmailSchema)
  .handler(async ({ data }) => {
    const user = await hexclaveServerApp.getUser()
    if (!user) throw new Error("Unauthorized")

    const { getResendClient, getAdminEmailTarget } = await import("@/lib/email/client")
    const resendClient = await getResendClient()
    const adminEmail = await getAdminEmailTarget()

    if (!resendClient) {
      throw new Error("Server configuration error")
    }

    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }

    const safeName = escapeHtml(data.name || user.displayName || "Client")
    const safeEmail = escapeHtml(data.email || user.primaryEmail || "")
    const safePhone = escapeHtml(data.phone || "")
    const safeNotes = escapeHtml(data.notes || "No notes provided.")
    const safeTitle = escapeHtml(data.estimateTitle || "")
    const safeLink = escapeHtml(data.link || "")

    const { error } = await resendClient.emails.send({
      from: 'AgencyOS <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Lead: ${safeName} - ${safeTitle}`,
      html: `
          <h1>New Consultation Request</h1>
          <p><strong>Project:</strong> ${safeTitle}</p>
          <p><strong>Est. Cost:</strong> $${data.totalCost}</p>
          <p><strong>Est. Hours:</strong> ${data.totalHours}h</p>
          <p><a href="${safeLink}">View Estimate Link</a></p>

          <hr />

          <h2>Client Details</h2>
          <ul>
              <li><strong>Name:</strong> ${safeName}</li>
              <li><strong>Email:</strong> ${safeEmail}</li>
              <li><strong>Phone:</strong> ${safePhone}</li>
          </ul>

          <h3>Notes:</h3>
          <p>${safeNotes}</p>
      `
    })

    if (error) {
      console.error("Resend Error:", error)
      throw new Error("Failed to send email")
    }

    return { success: true }
  })

