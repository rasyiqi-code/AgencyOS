import { createServerFn } from '@tanstack/react-start'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { z } from 'zod'
import { getPortfolios, savePortfolio, deletePortfolio, getRenderedHtml, getPortfolioHtml } from '@/lib/portfolios/actions'

async function requireAdmin() {
  const hasAccess = await isAdmin()
  if (!hasAccess) throw new Error('Unauthorized')
}

// 1. Ambil list portofolio
export const getPortfoliosFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      await requireAdmin()
      const data = await getPortfolios()
      return { success: true, data: JSON.parse(JSON.stringify(data)) }
    } catch (error) {
      return { success: false, error: (error as Error).message, data: [] }
    }
  })

// 2. Simpan portofolio (create/update)
const savePortfolioSchema = z.object({
  item: z.object({
    title: z.string(),
    slug: z.string().optional(),
    category: z.string(),
    description: z.string().optional(),
    externalUrl: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  html: z.string()
})

export const savePortfolioFn = createServerFn({ method: 'POST' })
  .validator(savePortfolioSchema)
  .handler(async ({ data }) => {
    try {
      await requireAdmin()
      const result = await savePortfolio(data.item as any, data.html)
      return { success: true, data: JSON.parse(JSON.stringify(result)) }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

// 3. Hapus portofolio
export const deletePortfolioFn = createServerFn({ method: 'POST' })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    try {
      await requireAdmin()
      await deletePortfolio(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

// 4. Render HTML dari URL
export const getRenderedHtmlFn = createServerFn({ method: 'POST' })
  .validator(z.object({ url: z.string(), localBaseUrl: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      await requireAdmin()
      const html = await getRenderedHtml(data.url, data.localBaseUrl)
      return { success: true, html }
    } catch (error) {
      return { success: false, error: (error as Error).message, html: "" }
    }
  })

// 5. Ambil HTML portofolio berdasarkan slug
export const getPortfolioHtmlFn = createServerFn({ method: 'POST' })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    try {
      await requireAdmin()
      const html = await getPortfolioHtml(slug)
      return { success: true, html }
    } catch (error) {
      return { success: false, error: (error as Error).message, html: "" }
    }
  })

