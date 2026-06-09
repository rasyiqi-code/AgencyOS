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
