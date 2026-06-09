import { createServerFn } from '@tanstack/react-start'

export const getServices = createServerFn({ method: 'GET' }).handler(async () => {
  const { prisma } = await import('@/lib/config/db')
  return prisma.service.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { price: 'asc' },
  })
})
