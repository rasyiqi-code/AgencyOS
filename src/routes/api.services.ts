import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { slugify } from '@/lib/shared/utils'

const billingPeriodMap: Record<string, string> = {
  monthly: 'every-month',
  yearly: 'every-year',
  one_time: 'once'
}

export const Route = createFileRoute('/api/services')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 50
          })
          return json(services, {
            headers: {
              'Cache-Control': 'public, max-age=3600'
            }
          })
        } catch (error) {
          console.error('Service API Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 })

        try {
          const formData = await request.formData()
          const action = formData.get('action')

          if (action === 'sync') {
            console.warn('Creem API: List Products not supported by current endpoint. Import skipped.')
            return json({ success: true, count: 0, warning: 'Import checks skipped: API limitation' })
          }

          const title = formData.get('title')?.toString()
          const title_id = formData.get('title_id')?.toString()
          const description = formData.get('description')?.toString()
          const description_id = formData.get('description_id')?.toString()
          const priceRaw = formData.get('price')?.toString()
          const currency = formData.get('currency')?.toString() || 'USD'
          const interval = formData.get('interval')?.toString() || 'one_time'
          const featuresRaw = formData.get('features')?.toString() || ''
          const featuresIdRaw = formData.get('features_id')?.toString() || ''
          const imageFile = formData.get('image') as File | null
          const slugInput = formData.get('slug')?.toString()

          if (!title || !description || !title_id || !description_id || !priceRaw) {
            console.error('Missing required fields in POST /api/services', { title, title_id, priceRaw })
            return json({ error: 'Missing required fields' }, { status: 400 })
          }

          const price = parseFloat(priceRaw)
          if (isNaN(price)) {
            return json({ error: 'Invalid price format' }, { status: 400 })
          }

          const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '')
          const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '')

          let imageUrl = null
          if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            try {
              const { uploadFile } = await import('@/lib/integrations/storage')
              imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`)
            } catch (storageError) {
              console.error('Storage upload failed:', storageError)
            }
          }

          let creemProductId = null
          try {
            const { creem } = await import('@/lib/integrations/creem')
            const sdk = await creem()
            const creemProduct = await sdk.products.create({
              name: title,
              description: description.replace(/<[^>]*>?/gm, '').slice(0, 255),
              price: Math.round(price * 100),
              currency,
              billingType: interval === 'one_time' ? 'onetime' : 'recurring',
              billingPeriod: (interval === 'one_time' ? 'once' : (billingPeriodMap[interval] || 'every-month')) as any,
              taxMode: 'inclusive',
              taxCategory: 'digital-goods-service',
              imageUrl: imageUrl || undefined
            })
            creemProductId = creemProduct.id
          } catch (error) {
            console.error('Failed to create Creem product (Proceeding anyway):', error)
          }

          const service = await prisma.service.create({
            data: {
              title,
              title_id,
              description,
              description_id,
              price,
              priceType: formData.get('priceType')?.toString() || 'FIXED',
              currency,
              interval,
              category: formData.get('category')?.toString() || 'Uncategorized',
              visibility: formData.get('visibility')?.toString() || 'PUBLIC',
              features,
              features_id,
              addons: (() => {
                try {
                  const val = formData.get('addons')
                  return val ? JSON.parse(val.toString()) : []
                } catch (e) {
                  return []
                }
              })(),
              addons_id: (() => {
                try {
                  const val = formData.get('addons_id')
                  return val ? JSON.parse(val.toString()) : []
                } catch (e) {
                  return []
                }
              })(),
              image: imageUrl,
              creemProductId,
              slug: slugInput ? slugify(slugInput) : slugify(title)
            } as any
          })

          return json(service, { status: 201 })
        } catch (error: any) {
          console.error('CRITICAL Service API Error:', error)
          return json({
            error: 'Internal Server Error',
            details: error.message || String(error)
          }, { status: 500 })
        }
      }
    }
  }
})
