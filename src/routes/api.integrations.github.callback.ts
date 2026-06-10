import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'
import { getAppUrl } from '@/lib/shared/url'
import type { PrismaWithIntegration } from '@/types/payment'

// Definisikan API Route '/api/integrations/github/callback'
export const Route = createFileRoute('/api/integrations/github/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Validasi apakah user saat ini adalah admin
        const hasAccess = await isAdmin()
        if (!hasAccess) {
          return new Response('Unauthorized', { status: 401 })
        }

        const url = new URL(request.url)
        const code = url.searchParams.get('code')

        if (!code) {
          return Response.redirect(
            `${getAppUrl()}/admin/system/integrations?error=${encodeURIComponent(
              'No code provided'
            )}`,
            302
          )
        }

        try {
          // 1. Tukarkan code dengan access token
          const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              client_id: process.env.GITHUB_CLIENT_ID,
              client_secret: process.env.GITHUB_CLIENT_SECRET,
              code,
            }),
          })

          const tokenData = (await tokenResponse.json()) as any

          if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error)
          }

          const accessToken = tokenData.access_token

          // 2. Ambil profil user GitHub
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
              'User-Agent': 'AgencyOS-App',
            },
          })

          const userData = (await userResponse.json()) as any

          if (!userData || !userData.login) {
            throw new Error('Failed to fetch user data from GitHub')
          }

          // 3. Simpan atau perbarui di database
          await (prisma as unknown as PrismaWithIntegration).systemIntegration.upsert({
            where: { provider: 'github' },
            update: {
              accessToken,
              accountName: userData.login,
              accountId: userData.id.toString(),
              isActive: true,
              metadata: {
                avatar_url: userData.avatar_url,
                html_url: userData.html_url,
              },
            },
            create: {
              provider: 'github',
              accessToken,
              accountName: userData.login,
              accountId: userData.id.toString(),
              isActive: true,
              metadata: {
                avatar_url: userData.avatar_url,
                html_url: userData.html_url,
              },
            },
          })

          // 4. Redirect kembali ke halaman integrasi admin dengan status sukses
          return Response.redirect(`${getAppUrl()}/admin/system/integrations?success=github`, 302)
        } catch (error: any) {
          console.error('GitHub OAuth Callback Error:', error)
          const errorMessage = error instanceof Error ? error.message : 'GitHub authentication failed'
          return Response.redirect(
            `${getAppUrl()}/admin/system/integrations?error=${encodeURIComponent(errorMessage)}`,
            302
          )
        }
      },
    },
  },
})
