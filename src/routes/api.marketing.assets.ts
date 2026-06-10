import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'
import { isAdmin } from '@/lib/shared/auth-helpers'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

export const Route = createFileRoute('/api/marketing/assets')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url)
          const scope = url.searchParams.get('scope') || 'user'
          const type = url.searchParams.get('type') || undefined

          if (scope === 'public') {
            const assets = await prisma.marketingAsset.findMany({
              where: {
                isActive: true,
                type: type || 'banner_widget'
              },
              select: {
                id: true,
                title: true,
                content: true,
                imageUrl: true,
                category: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            })

            return new Response(JSON.stringify(assets), {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            })
          }

          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          if (scope === 'admin') {
            const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
            const superAdminId = process.env.SUPER_ADMIN_ID
            const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId

            if (!isSuperAdmin) {
              return json({ error: 'Forbidden' }, { status: 403 })
            }

            const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10), 1), 100)
            const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)
            const skip = (page - 1) * limit

            const assets = await prisma.marketingAsset.findMany({
              where: type ? { type } : undefined,
              orderBy: { createdAt: 'desc' },
              take: limit,
              skip
            })

            return json(assets)
          }

          const userIsAdmin = await isAdmin()
          const affiliate = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
          })
          const isAffiliate = affiliate && affiliate.status === 'active'

          if (!userIsAdmin && !isAffiliate) {
            return json({ error: 'Forbidden' }, { status: 403 })
          }

          const assets = await prisma.marketingAsset.findMany({
            where: {
              isActive: true,
              type: type || undefined
            },
            orderBy: { createdAt: 'desc' },
            take: 50
          })

          return json(assets)
        } catch (error) {
          console.error('Marketing Assets GET Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      },
      OPTIONS: async () => {
        return new Response(null, {
          headers: corsHeaders
        })
      }
    }
  }
})
