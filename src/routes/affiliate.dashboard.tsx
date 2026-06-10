import { createFileRoute, redirect } from '@tanstack/react-router'
import { hexclaveClientApp } from '@/lib/config/hexclave-client'
import { AffiliateLinksManager } from '@/components/affiliate/affiliate-links-manager'
import { DollarSign, Users, MousePointerClick, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAffiliateDashboardData } from '@/src/server/affiliates'
import { BankSettingsCard } from '@/components/affiliate/bank-settings-card'

export const Route = createFileRoute('/affiliate/dashboard')({
  beforeLoad: async () => {
    const user = await hexclaveClientApp.getUser()
    if (!user) throw redirect({ href: '/handler/sign-in' })
  },
  loader: async () => {
    const data = await getAffiliateDashboardData()
    if (!data) throw redirect({ href: '/handler/sign-in' })
    if (!data.profile) throw redirect({ to: '/affiliate/join' })
    return data
  },
  component: AffiliateDashboardLayout,
})

function AffiliateDashboardLayout() {
  const data = Route.useLoaderData()
  if (!data) return null

  const { profile, lifetimeTotal, products, services } = data
  if (!profile) return null

  const totalEarnings = lifetimeTotal
  const totalSales = profile._count?.commissions ?? 0

  return (
    <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500 text-left">

      {/* Referral Link Section */}
      <AffiliateLinksManager
        referralCode={profile.referralCode}
        products={products}
        services={services}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-zinc-500 mt-1">Lifetime generated</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{(profile._count?.referrals ?? 0).toLocaleString()}</div>
            <p className="text-xs text-zinc-500 mt-1">Visitor traffic</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Commission Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{profile.commissionRate}%</div>
            <p className="text-xs text-zinc-500 mt-1">Per successful sale</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Sales</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSales}</div>
            <p className="text-xs text-zinc-500 mt-1">Conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* Commissions Table */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Recent Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.commissions && profile.commissions.length > 0 ? (
                <div className="rounded-md border border-zinc-800 overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-zinc-400 border-b border-zinc-800 bg-zinc-900/50">
                    <div>Date</div>
                    <div>Order ID</div>
                    <div>Status</div>
                    <div className="text-right">Amount</div>
                  </div>
                  {profile.commissions.map((comm: any) => (
                    <div key={comm.id} className="grid grid-cols-4 gap-4 p-4 text-sm text-zinc-300 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <div>{new Date(comm.createdAt).toLocaleDateString()}</div>
                      <div className="font-mono text-xs text-zinc-500 truncate">{comm.orderId || "-"}</div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium 
                          ${comm.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                            comm.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-red-500/10 text-red-500'}`}>
                          {comm.status}
                        </span>
                      </div>
                      <div className="text-right font-medium text-white">${comm.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-500">
                  No commissions yet. Share your link to start earning!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-8">
          <BankSettingsCard initialData={profile.bankInfo as unknown as { bankName?: string; accountNumber?: string; accountHolder?: string }} />
        </div>
      </div>
    </div>
  )
}
