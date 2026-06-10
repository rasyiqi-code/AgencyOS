import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { getAppUrl } from '@/lib/shared/url'

// Definisikan API Route '/api/integrations/github/authorize'
export const Route = createFileRoute('/api/integrations/github/authorize')({
  server: {
    handlers: {
      GET: async () => {
        // Validasi apakah user saat ini adalah admin
        const hasAccess = await isAdmin()
        if (!hasAccess) {
          return new Response('Unauthorized', { status: 401 })
        }

        const clientId = process.env.GITHUB_CLIENT_ID
        const redirectUri = `${getAppUrl()}/api/integrations/github/callback`

        if (!clientId) {
          return json({ error: 'GITHUB_CLIENT_ID not configured' }, { status: 500 })
        }

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=repo,read:user&state=github_oauth`

        return Response.redirect(githubAuthUrl, 302)
      },
    },
  },
})
