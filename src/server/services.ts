import { createServerFn } from '@tanstack/react-start'
import { getServices as fetchServicesFromDb, getServiceBySlug as fetchServiceBySlugFromDb } from '@/lib/server/services'
import { z } from 'zod'

export const getServices = createServerFn({ method: 'GET' }).handler(async () => {
  const { prisma } = await import('@/lib/config/db')
  return prisma.service.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { price: 'asc' },
  })
})

// Fungsi publik untuk mendapatkan semua layanan aktif
export const getPublicServicesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const data = await fetchServicesFromDb(true)
    return JSON.parse(JSON.stringify(data))
  })

// Fungsi publik untuk mendapatkan detail layanan berdasarkan slug
export const getPublicServiceBySlugFn = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const data = await fetchServiceBySlugFromDb(slug)
    if (!data) return null
    return JSON.parse(JSON.stringify(data))
  })


