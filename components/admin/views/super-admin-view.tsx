import { prisma } from "@/lib/config/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Layers, Users, Zap, ArrowUpRight, ArrowRight } from "lucide-react";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

export async function SuperAdminDashboardView() {
    // Ambil data Jasa Agensi (Services) secara paralel
    const [revenueResult, activeCount, pendingCount, totalClientsResult] = await Promise.all([
        prisma.estimate.aggregate({
            where: { status: 'paid' },
            _sum: { totalCost: true }
        }),
        prisma.project.count({
            where: { status: { in: ['queue', 'dev'] } }
        }),
        prisma.estimate.count({
            where: { status: 'pending_payment' }
        }),
        prisma.project.groupBy({
            by: ['userId'],
        })
    ]);

    const stats = {
        revenue: revenueResult._sum.totalCost || 0,
        activeCount,
        pendingCount,
        totalClients: totalClientsResult.length
    };

    return (
        <div className="flex flex-col gap-6 w-full py-6">
            <AdminHeaderSetter
                title="Command Center"
                actions={
                    <Button className="bg-white text-black hover:bg-zinc-200 w-auto px-2.5 sm:px-4">
                        <Zap className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Quick Action</span>
                    </Button>
                }
            />

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-black/20 border-white/5">
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

                <Card className="bg-black/20 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Active Projects
                        </CardTitle>
                        <Layers className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            In Queue or Development
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Unique Clients
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            With at least 1 project
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Pending Quotes</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.pendingCount}</div>
                        <p className="text-xs text-amber-500 mt-1">Needs attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation Hub */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <Link href="/admin/pm/projects" className="group">
                    <div className="rounded-xl border border-white/5 bg-black/20 p-6 hover:bg-black/40 transition-all cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Manage Projects</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500">View detailed registry, assign squads, and update status.</p>
                    </div>
                </Link>

                <Link href="/admin/finance/orders" className="group">
                    <div className="rounded-xl border border-white/5 bg-black/20 p-6 hover:bg-black/40 transition-all cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Finance & Orders</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500">Track invoices, verify manual payments, and check revenue.</p>
                    </div>
                </Link>

                <Link href="/admin/system/settings" className="group">
                    <div className="rounded-xl border border-white/5 bg-black/20 p-6 hover:bg-black/40 transition-all cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">System Settings</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500">Configure global settings, integrations, and operational rules.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
