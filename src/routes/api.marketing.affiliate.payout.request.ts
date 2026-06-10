import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { prisma } from '@/lib/config/db'
import { Prisma } from '@prisma/client'

export const Route = createFileRoute('/api/marketing/affiliate/payout/request')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return new Response('Unauthorized', { status: 401 })
          }

          const profile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id },
          })

          if (!profile) {
            return json({ error: 'Not found' }, { status: 404 })
          }

          const requests = await prisma.payoutRequest.findMany({
            where: { affiliateId: profile.id },
            orderBy: { createdAt: 'desc' },
          })

          return json({
            requests: JSON.parse(JSON.stringify(requests)),
            balance: profile.totalEarnings - profile.paidEarnings,
          })
        } catch (error) {
          console.error('Payout List Error:', error)
          return new Response('Internal Error', { status: 500 })
        }
      },
      POST: async () => {
        try {
          const user = await hexclaveServerApp.getUser()
          if (!user) {
            return new Response('Unauthorized', { status: 401 })
          }

          const profile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id },
          })

          if (!profile) {
            return json({ error: 'Affiliate profile not found' }, { status: 404 })
          }

          const availableBalance = profile.totalEarnings - profile.paidEarnings
          const MIN_PAYOUT = 50

          if (availableBalance < MIN_PAYOUT) {
            return json(
              {
                error: `Minimum payout is $${MIN_PAYOUT}. Your available balance is $${availableBalance.toFixed(2)}.`,
              },
              { status: 400 },
            )
          }

          // Cek apakah ada request pending yang belum diproses
          const existingPending = await prisma.payoutRequest.findFirst({
            where: { affiliateId: profile.id, status: 'pending' },
          })

          if (existingPending) {
            return json(
              {
                error: 'You already have a pending payout request. Please wait for it to be processed.',
              },
              { status: 400 },
            )
          }

          // Buat payout request dengan snapshot bank info
          const payoutRequest = await prisma.payoutRequest.create({
            data: {
              affiliateId: profile.id,
              amount: availableBalance,
              bankInfo: profile.bankInfo ?? Prisma.JsonNull,
            },
          })

          return json({ success: true, payoutRequest: JSON.parse(JSON.stringify(payoutRequest)) })
        } catch (error) {
          console.error('Payout Request Error:', error)
          return new Response('Internal Error', { status: 500 })
        }
      },
    },
  },
})
