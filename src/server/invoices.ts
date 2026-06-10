import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { canManageBilling } from '@/lib/shared/auth-helpers'

// Validasi akses administrator keuangan
async function requireBillingAdmin() {
  const user = await hexclaveServerApp.getUser()
  if (!user) throw new Error('Unauthorized')
  const hasAccess = await canManageBilling()
  if (!hasAccess) throw new Error('Forbidden')
  return user
}

// Mengambil daftar invoice (estimate) yang bukan draft
export const getAdminInvoicesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireBillingAdmin()

    const estimates = await prisma.estimate.findMany({
      where: { status: { not: 'draft' } },
      orderBy: { createdAt: 'desc' }
    })

    return estimates.map(est => ({
      ...est,
      createdAt: est.createdAt.toISOString(),
    }))
  })

// Mengubah status invoice menjadi paid secara manual
export const markInvoiceAsPaidFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireBillingAdmin()

    await prisma.estimate.update({
      where: { id },
      data: { status: 'paid' }
    })

    return { success: true }
  })
