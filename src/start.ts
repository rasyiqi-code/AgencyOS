import { createStart, createCsrfMiddleware } from '@tanstack/react-start'

// Konfigurasikan CSRF middleware untuk mengamankan endpoint RPC serverFn
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware],
  }
})
