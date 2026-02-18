import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { redirect } from "next/navigation";
import { AffiliateLinksManager } from "@/components/affiliate/affiliate-links-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { BankSettingsCard } from "@/components/affiliate/bank-settings-card";

export default async function AffiliateDashboardPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    const profile = await prisma.affiliateProfile.findUnique({
        where: { userId: user.id },
        include: {
            commissions: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            _count: {
                select: { referrals: true, commissions: true }
            }
        }
    });

    if (!profile) {
        redirect('/affiliate/join');
    }

    // Calculate real-time stats
    const stats = await prisma.commissionLog.aggregate({
        where: { affiliateId: profile.id },
        _sum: { amount: true }
    });

    const totalEarnings = stats._sum.amount || 0;
    const totalSales = profile._count.commissions;

    if (!profile) {
        redirect('/affiliate/join');
    }

    // Fetch available products and services for deep linking
    const activeProducts = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, price: true, type: true, description: true }
    });

    const activeServices = await prisma.service.findMany({
        where: { isActive: true },
        select: { id: true, title: true, price: true, description: true }
    });

    return (
        <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Partner Dashboard</h1>
                <p className="text-zinc-400 mt-2">
                    Start referring and track your earnings.
                </p>
            </div>

            {/* Referral Link Section */}
            <AffiliateLinksManager
                referralCode={profile.referralCode}
                products={activeProducts}
                services={activeServices}
                baseUrl={process.env.NEXT_PUBLIC_APP_URL}
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
                        <div className="text-2xl font-bold text-white">{profile._count.referrals.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Visitor traffic</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Commission Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-brand-yellow" />
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
                            {profile.commissions.length > 0 ? (
                                <div className="rounded-md border border-zinc-800">
                                    <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-zinc-400 border-b border-zinc-800 bg-zinc-900/50">
                                        <div>Date</div>
                                        <div>Order ID</div>
                                        <div>Status</div>
                                        <div className="text-right">Amount</div>
                                    </div>
                                    {profile.commissions.map((comm) => (
                                        <div key={comm.id} className="grid grid-cols-4 gap-4 p-4 text-sm text-zinc-300 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/20 transition-colors">
                                            <div>{new Date(comm.createdAt).toLocaleDateString()}</div>
                                            <div className="font-mono text-xs text-zinc-500">{comm.orderId || "-"}</div>
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
    );
}
