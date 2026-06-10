import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { notifyNewAffiliate } from '@/lib/email/admin-notifications'
import { secureRandomInt } from '@/lib/utils/crypto'
import { getSystemSettings } from '@/src/server/settings'

export const Route = createFileRoute('/api/marketing/affiliate/register')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
          }

          const existingProfile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
          })

          if (existingProfile) {
            return json({ message: 'Already registered', profile: existingProfile })
          }

          const namePart = (user.displayName || 'user').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
          let referralCode = `${namePart}${secureRandomInt(0, 1000)}`

          const MAX_RETRIES = 10
          let isUnique = false
          let retries = 0
          while (!isUnique) {
            if (retries >= MAX_RETRIES) {
              return json(
                { error: 'Failed to generate unique referral code. Please try again.' },
                { status: 500 }
              )
            }
            const check = await prisma.affiliateProfile.findUnique({ where: { referralCode } })
            if (!check) {
              isUnique = true
            } else {
              referralCode = `${namePart}${secureRandomInt(0, 100000)}`
              retries++
            }
          }

          const commissionSettings = await getSystemSettings({ data: ['affiliate_default_commission_rate'] })
          const defaultRateValue = commissionSettings?.find(s => s.key === 'affiliate_default_commission_rate')?.value
          const defaultRate = defaultRateValue ? parseFloat(defaultRateValue) : 10

          const profile = await prisma.affiliateProfile.create({
            data: {
              userId: user.id,
              name: user.displayName || user.primaryEmail || 'Affiliate',
              email: user.primaryEmail || '',
              referralCode,
              status: 'active',
              commissionRate: defaultRate,
            }
          })

          notifyNewAffiliate({
            name: profile.name,
            email: profile.email,
            code: profile.referralCode
          }).catch(err => console.error('Failed to send admin notification:', err))

          return json(profile)
        } catch (error) {
          console.error('Affiliate Register Error:', error)
          return json({ error: 'Internal Error' }, { status: 500 })
        }
      }
    }
  }
})
