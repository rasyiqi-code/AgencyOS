import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { prisma } from '@/lib/config/db'
import { hexclaveServerApp } from '@/lib/config/hexclave'

export const Route = createFileRoute('/api/squad/payout')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await hexclaveServerApp.getUser()
        if (!user) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
          })

          if (!squadProfile) {
            return json({ error: 'Squad profile not found' }, { status: 404 })
          }

          const { amount, method, details } = await request.json()

          if (!amount || amount <= 0) {
            return json({ error: 'Invalid amount' }, { status: 400 })
          }

          const payoutRequest = await prisma.payoutRequest.create({
            data: {
              squadId: squadProfile.id,
              amount: parseFloat(amount),
              bankInfo: details || {},
              notes: `Squad payout request via ${method}`,
            }
          })

          return json({ success: true, payoutRequest })
        } catch (error) {
          console.error('Squad payout error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
