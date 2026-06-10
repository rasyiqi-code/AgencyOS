import { createFileRoute, redirect } from '@tanstack/react-router'
import { hexclaveClientApp } from '@/lib/config/hexclave-client'
import { PayoutsClient } from '@/components/marketing/payouts-client'
import { getAffiliatePayoutData } from '@/src/server/affiliates'

export const Route = createFileRoute('/affiliate/payouts')({
  beforeLoad: async () => {
    const user = await hexclaveClientApp.getUser()
    if (!user) throw redirect({ href: '/handler/sign-in' })
  },
  loader: async () => {
    const data = await getAffiliatePayoutData()
    if (!data) throw redirect({ to: '/affiliate/join' })
    return data
  },
  component: AffiliatePayoutsPage,
})

function AffiliatePayoutsPage() {
  const data = Route.useLoaderData()
  if (!data) return null

  return (
    <PayoutsClient
      initialBalance={data.availableBalance}
      affiliateName={data.name}
      totalEarnings={data.totalEarnings}
      paidEarnings={data.paidEarnings}
    />
  )
}
