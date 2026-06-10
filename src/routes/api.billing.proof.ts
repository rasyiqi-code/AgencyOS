import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { getCurrentUser } from '@/lib/shared/auth-helpers'

export const Route = createFileRoute('/api/billing/proof')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // Auth check: hanya user login yang boleh upload bukti bayar
          const user = await getCurrentUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const formData = await request.formData()
          const file = formData.get('file') as File
          const estimateId = formData.get('estimateId') as string
          const orderId = formData.get('orderId') as string

          if (!file) {
            return json({ error: 'Missing file' }, { status: 400 })
          }

          // Validasi ukuran file — maksimal 5MB
          const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
          if (file.size > MAX_FILE_SIZE) {
            return json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
          }

          if (!estimateId && !orderId) {
            return json({ error: 'Missing ID' }, { status: 400 })
          }

          const { uploadFile } = await import('@/lib/integrations/storage')

          // Handle Estimate Proof
          if (estimateId) {
            // Ownership check: verifikasi estimate terkait project milik user
            const estimate = await prisma.estimate.findUnique({
              where: { id: estimateId },
              include: { project: true }
            })
            if (!estimate || (estimate.project && estimate.project.userId !== user.id)) {
              return json({ error: 'Forbidden' }, { status: 403 })
            }

            const path = `proofs/${estimateId}-${Date.now()}-${file.name}`
            const url = await uploadFile(file, path)

            await prisma.estimate.update({
              where: { id: estimateId },
              data: { proofUrl: url }
            })

            return json({ success: true, url })
          }

          // Handle Order Proof
          if (orderId) {
            // First try updating standard Order
            const order = await prisma.order.findUnique({ where: { id: orderId } })

            if (order) {
              if (order.userId !== user.id) {
                return json({ error: 'Forbidden' }, { status: 403 })
              }

              const path = `proofs/orders/${orderId}-${Date.now()}-${file.name}`
              const url = await uploadFile(file, path)

              await prisma.order.update({
                where: { id: orderId },
                data: {
                  proofUrl: url,
                  status: 'waiting_verification'
                }
              })

              return json({ success: true, url })
            }

            // If not found in Order, try DigitalOrder
            const digitalOrder = await prisma.digitalOrder.findUnique({ where: { id: orderId } })
            if (digitalOrder) {
              if (digitalOrder.userId !== user.id) {
                return json({ error: 'Forbidden' }, { status: 403 })
              }

              const path = `proofs/digital-orders/${orderId}-${Date.now()}-${file.name}`
              const url = await uploadFile(file, path)

              await prisma.digitalOrder.update({
                where: { id: orderId },
                data: {
                  proofUrl: url,
                  status: 'WAITING_VERIFICATION'
                } as unknown as Record<string, unknown>
              })

              return json({ success: true, url })
            }

            return json({ error: 'Not Found' }, { status: 404 })
          }

          return json({ error: 'Invalid request' }, { status: 400 })

        } catch (error) {
          console.error('Upload Proof Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
