import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/api/public/verify-license')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const { key, productSlug, machineId, domain } = body

          if (!key) {
            return json({ valid: false, message: 'License key required' }, { status: 400 })
          }

          const activeProductSlug = productSlug || body.productId || body.product_slug

          if (!activeProductSlug) {
            return json({ valid: false, message: 'Product slug/ID required' }, { status: 400 })
          }

          const license = await prisma.license.findUnique({
            where: { key },
            include: { product: true }
          })

          if (!license) {
            return json({ valid: false, message: 'Invalid license key' }, { status: 404 })
          }

          if (license.product.slug !== activeProductSlug) {
            return json({ valid: false, message: 'Invalid product for this license' }, { status: 403 })
          }

          if (license.status !== 'active') {
            return json({ valid: false, message: 'License is not active' }, { status: 403 })
          }

          if (license.expiresAt && new Date() > license.expiresAt) {
            return json({ valid: false, message: 'License expired' }, { status: 403 })
          }

          const metadata = (license.metadata as object) || {}
          const currentActivations = metadata as { devices?: string[] }
          const devices: string[] = Array.isArray(currentActivations.devices) ? currentActivations.devices : []

          const identifierParts = []
          if (domain) identifierParts.push(domain)
          if (machineId) identifierParts.push(machineId)

          const deviceId = identifierParts.length > 0 ? identifierParts.join('|') : 'unknown'
          const isAlreadyActivated = devices.includes(deviceId)

          if (!isAlreadyActivated) {
            if (license.activations >= license.maxActivations) {
              return json({ valid: false, message: 'Max activations reached' }, { status: 403 })
            }

            devices.push(deviceId)

            await prisma.license.update({
              where: { id: license.id },
              data: {
                activations: { increment: 1 },
                metadata: { ...currentActivations, devices } as any
              }
            })
          }

          return json({
            valid: true,
            product: {
              name: license.product.name,
              slug: license.product.slug
            },
            license: {
              id: license.id,
              expiresAt: license.expiresAt
            }
          })
        } catch (error) {
          console.error('[VERIFY_LICENSE]', error)
          return json({ error: 'Internal Error' }, { status: 500 })
        }
      }
    }
  }
})
