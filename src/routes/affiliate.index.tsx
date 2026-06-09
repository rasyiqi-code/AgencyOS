import { createFileRoute } from '@tanstack/react-router'
import { hexclaveServerApp } from '@/lib/config/hexclave'
import { redirect } from '@tanstack/react-router'
import { AffiliateLinksManager } from '@/components/affiliate/affiliate-links-manager'
import { prisma } from '@/lib/config/db'
import { DollarSign, Users, MousePointerClick, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/affiliate/')({
  beforeLoad: async () => {
    const user = await hexclaveServerApp.getUser()
    // Menggunakan href agar tidak memicu type error rute statis
    if (!user) throw redirect({ href: '/handler/sign-in' })
  },
  loader: async () => {
    const user = await hexclaveServerApp.getUser()
    if (!user) return null

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
      include: {
        _count: { select: { referrals: true, commissions: true } },
        commissions: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    })

    const lifetimeTotal = await prisma.commissionLog.aggregate({
      where: { affiliateId: profile?.id },
      _sum: { amount: true },
    })

    const products = await prisma.product.findMany({ where: { isActive: true } })
    const services = await prisma.service.findMany({ where: { isActive: true } })

    return { profile, lifetimeTotal: lifetimeTotal._sum.amount ?? 0, products, services }
  },
  component: AffiliateDashboardLayout,
})

function AffiliateDashboardLayout() {
  const data = Route.useLoaderData()
  if (!data) return null

  const { profile, lifetimeTotal, products, services } = data

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-zinc-400 mt-1">Track your referrals and earnings</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?._count?.referrals ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?._count?.commissions ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Lifetime Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${lifetimeTotal.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Commission Rate</CardTitle>
              <MousePointerClick className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.commissionRate ?? 0}%</div>
            </CardContent>
          </Card>
        </div>

        {products.length > 0 || services.length > 0 ? (
          // Meneruskan prop referralCode yang wajib untuk inisialisasi link
          <AffiliateLinksManager referralCode={profile?.referralCode || ''} products={products} services={services} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            No products or services available for promotion yet.
          </div>
        )}
      </main>
    </div>
  )
}
