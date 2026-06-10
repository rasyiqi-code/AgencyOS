import { createServerFn, createMiddleware } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const authMiddleware = createMiddleware().server(
  async ({ next }) => {
    const user = await hexclaveServerApp.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }
    return next({ context: { user } })
  },
)

export const adminMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const { isAdmin } = await import('@/lib/shared/auth-helpers')
    if (!await isAdmin()) {
      throw new Error('Forbidden')
    }
    return next({ context: { ...context, isAdmin: true } })
  })

export const requireAuth = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) {
      return null
    }
    return {
      id: user.id,
      displayName: user.displayName || undefined,
      primaryEmail: user.primaryEmail || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
    }
  },
)

// Server function untuk memeriksa status admin secara aman dari client bundle
export const isAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAdmin } = await import('@/lib/shared/auth-helpers')
  return await isAdmin()
})

// Server function untuk memeriksa akses manajemen proyek
export const canManageProjectsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { canManageProjects } = await import('@/lib/shared/auth-helpers')
  return await canManageProjects()
})

// Server function untuk memeriksa akses billing/keuangan
export const canManageBillingFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { canManageBilling } = await import('@/lib/shared/auth-helpers')
  return await canManageBilling()
})

