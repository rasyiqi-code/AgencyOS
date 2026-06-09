import { createServerFn } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'
import { mapPrismaProjectToExtended } from '@/lib/shared/mappers'

export const getDashboardData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const prismaProjects = await prisma.project.findMany({
      where: {
        userId: user.id,
        status: { not: 'payment_pending' },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        briefs: true,
        dailyLogs: true,
        feedback: true,
        service: true,
        estimate: {
          include: { service: true },
        },
      },
    })

    const projects = prismaProjects.map(mapPrismaProjectToExtended)

    const paidOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'paid',
      },
      select: { amount: true },
    })

    const totalInvestment = paidOrders.reduce((sum, order) => sum + order.amount, 0)

    const nextInvoice = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
    })

    return {
      displayName: user.displayName,
      projects,
      totalInvestment,
      nextInvoice: nextInvoice
        ? { ...nextInvoice, createdAt: nextInvoice.createdAt.toISOString() }
        : null,
    }
  },
)
