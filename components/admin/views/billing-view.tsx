
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Zap, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/config/db";

export async function BillingDashboardView() {
    // Fetch Finance Specific Stats
    const stats = await prisma.$transaction(async (tx) => {
        const revenue = await tx.estimate.aggregate({
            where: { status: 'paid' },
            _sum: { totalCost: true }
        });
        const pendingOrders = await tx.estimate.count({
            where: { status: 'pending_payment' }
        });
        return { revenue: revenue._sum.totalCost || 0, pendingOrders };
    });

    return (
        <div className="flex flex-col gap-6 w-full py-6">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Finance Command</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-zinc-900/40 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.revenue)}
                        </div>
                        <p className="text-xs text-emerald-500 mt-1 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Lifetime Earnings
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Pending Orders</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.pendingOrders}</div>
                        <p className="text-xs text-amber-500 mt-1">Needs Invoice Action</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-6">
                <Link href="/admin/finance/orders" className="group">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Manage Invoices & Orders</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500">Full access to order history and payment verification.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
