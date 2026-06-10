import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'

export const Route = createFileRoute('/api/marketing/track')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { code, source, visitorId } = await request.json()

          if (!code) {
            return new Response('Missing code', { status: 400 })
          }

          const affiliate = await prisma.affiliateProfile.findUnique({
            where: { referralCode: code }
          })

          if (!affiliate || affiliate.status !== 'active') {
            return json({ status: 'invalid' })
          }

          if (visitorId) {
            const existing = await prisma.referralUsage.findFirst({
              where: {
                affiliateId: affiliate.id,
                visitorId
              }
            })

            if (existing) {
              return json({ status: 'ok' }, {
                headers: {
                  'Set-Cookie': `agencyos_affiliate_id=${code}; Max-Age=${60 * 60 * 24 * 30}; Path=/; HttpOnly; SameSite=Lax`
                }
              })
            }
          }

          try {
            await prisma.referralUsage.create({
              data: {
                affiliateId: affiliate.id,
                source: source || 'direct',
                visitorId
              }
            })
          } catch (error: any) {
            if (error && typeof error === 'object' && error.code === 'P2002') {
              return json({ status: 'ok' }, {
                headers: {
                  'Set-Cookie': `agencyos_affiliate_id=${code}; Max-Age=${60 * 60 * 24 * 30}; Path=/; HttpOnly; SameSite=Lax`
                }
              })
            }
            throw error
          }

          return json({ status: 'ok' }, {
            headers: {
              'Set-Cookie': `agencyos_affiliate_id=${code}; Max-Age=${60 * 60 * 24 * 30}; Path=/; HttpOnly; SameSite=Lax`
            }
          })
        } catch (error) {
          console.error('Referral Track Error:', error)
          return new Response('Internal Error', { status: 500 })
        }
      }
    }
  }
})
