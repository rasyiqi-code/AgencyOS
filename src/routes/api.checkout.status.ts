import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/checkout/status')({
  server: {
    handlers: {
      PATCH: async ({ request }: { request: Request }) => {
        if (!await isAdmin()) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { estimateId: targetId, status } = await request.json()
          if (!targetId || !status) {
            return json({ error: 'Missing required fields' }, { status: 400 })
          }

          const isOrderId = targetId.startsWith('ORDER-')
          let actualEstimateId = isOrderId ? null : targetId
          let orderFromId = null

          if (isOrderId) {
            orderFromId = await prisma.order.findUnique({
              where: { id: targetId },
              include: {
                project: {
                  include: { estimate: true }
                }
              }
            })
            actualEstimateId = orderFromId?.project?.estimate?.id || null
          }

          const estimate = actualEstimateId ? await prisma.estimate.findUnique({
            where: { id: actualEstimateId },
            include: { project: true }
          }) : null

          const project = estimate?.project || orderFromId?.project

          if (!project && !estimate) {
            return json({ error: 'Transaction/Invoice not found' }, { status: 404 })
          }

          if (actualEstimateId) {
            await prisma.estimate.update({
              where: { id: actualEstimateId },
              data: { status }
            })
          }

          if (project) {
            await prisma.project.update({
              where: { id: project.id },
              data: { status }
            })
          }

          // Kirim email notifikasi jika pembayaran dibatalkan/revert ke pending
          if (project && status === 'pending_payment') {
            try {
              const stackUser = await hexclaveServerApp.getUser(project.userId)
              if (stackUser?.primaryEmail) {
                const { sendPaymentRevertedEmail } = await import('@/lib/email/client-notifications')
                sendPaymentRevertedEmail({
                  to: stackUser.primaryEmail,
                  customerName: stackUser.displayName || stackUser.primaryEmail.split('@')[0] || 'Client',
                  orderId: targetId,
                  productName: project.title || estimate?.title || 'Service'
                }).catch(err => console.error('Revert notification error:', err))
              }
            } catch (err) {
              console.error('Failed to fetch user for revert notification:', err)
            }
          }

          return json({ success: true })
        } catch (error) {
          console.error('Failed to update status:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
