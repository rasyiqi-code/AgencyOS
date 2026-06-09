import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Layers, Users, Zap, ArrowUpRight, ArrowRight, Package } from "lucide-react";

interface SuperAdminDashboardViewProps {
    mode?: string;
    stats: {
        revenue: number;
        activeCount: number;
        pendingCount: number;
        totalClients: number;
    };
}

export function SuperAdminDashboardView({ mode = 'services', stats }: SuperAdminDashboardViewProps) {
    const isDigital = mode === 'digital';

    return (
        <div className="flex flex-col gap-6 w-full py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {isDigital ? "Digital Store Console" : "Command Center"}
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        {isDigital ? "Digital products sales and license performance." : "Agency performance at a glance."}
                    </p>
                </div>
                <Button className="bg-white text-black hover:bg-zinc-200 w-full sm:w-auto">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Action
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            {isDigital ? "Active Products" : "Active Projects"}
                        </CardTitle>
                        {isDigital ? <Package className="h-4 w-4 text-blue-500" /> : <Layers className="h-4 w-4 text-blue-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeCount}</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {isDigital ? "Active in store" : "In Queue or Development"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            {isDigital ? "Unique Customers" : "Unique Clients"}
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {isDigital ? "With at least 1 purchase" : "With at least 1 project"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Pending Orders</CardTitle>
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
                {isDigital ? (
                    <>
                        <Link to="/admin/products" className="group">
                            <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Manage Products</h3>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="text-sm text-zinc-500">View and configure digital store files, pricing, and downloads.</p>
                            </div>
                        </Link>

                        <Link to="/admin/digital-sales" className="group">
                            <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Digital Sales</h3>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="text-sm text-zinc-500">Review digital purchases, licenses generated, and payment status.</p>
                            </div>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/admin/pm/projects" className="group">
                            <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Manage Projects</h3>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="text-sm text-zinc-500">View detailed registry, assign squads, and update status.</p>
                            </div>
                        </Link>

                        <Link to="/admin/finance/orders" className="group">
                            <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Finance & Orders</h3>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="text-sm text-zinc-500">Track invoices, verify manual payments, and check revenue.</p>
                            </div>
                        </Link>
                    </>
                )}

                <Link to="/admin/system/settings" className="group">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full">
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
