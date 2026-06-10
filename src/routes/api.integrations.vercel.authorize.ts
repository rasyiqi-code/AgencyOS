import { createFileRoute } from '@tanstack/react-router'
import { getAppUrl } from '@/lib/shared/url'

// Definisikan API Route '/api/integrations/vercel/authorize' (Mock)
export const Route = createFileRoute('/api/integrations/vercel/authorize')({
  server: {
    handlers: {
      GET: async () => {
        // Karena integrasi Vercel belum diimplementasikan di backend, arahkan kembali dengan pesan error
        const errorMessage = 'Integrasi Vercel belum dikonfigurasi di server.'
        return Response.redirect(
          `${getAppUrl()}/admin/system/integrations?error=${encodeURIComponent(errorMessage)}`,
          302
        )
      },
    },
  },
})
