import {
  createMiddleware,
  createServerFn,
  redirect as startRedirect,
} from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const user = await hexclaveServerApp.getUser()
    if (!user) {
      throw startRedirect({ href: '/handler/sign-in' })
    }
    return next({ context: { user } })
  },
)

export const adminMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const { isAdmin } = await import('@/lib/shared/auth-helpers')
    if (!await isAdmin()) {
      throw startRedirect({ href: '/dashboard' })
    }
    return next({ context: { ...context, isAdmin: true } })
  })
