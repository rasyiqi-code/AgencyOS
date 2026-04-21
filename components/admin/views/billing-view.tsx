
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Zap, ArrowRight, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/config/db";
import { getTranslations } from "next-intl/server";
import { paymentService } from "@/lib/server/payment-service";

export async function BillingDashboardView() {
    const t = await getTranslations("Admin.Finance.Dashboard");
    
    // Fetch Finance Specific Stats
    const stats = await prisma.$transaction(async (tx) => {
        // Service Revenue
        const serviceRevenue = await tx.estimate.aggregate({
            where: { status: 'paid' },
            _sum: { totalCost: true }
        });

        // Digital Revenue
        const digitalRevenue = await tx.digitalOrder.aggregate({
            where: { status: 'PAID' },
            _sum: { amount: true }
        });

        const pendingOrders = await tx.estimate.count({
            where: { status: 'pending_payment' }
        });

        const pendingDigital = await tx.digitalOrder.count({
            where: { status: 'PENDING' }
        });

        return { 
            revenue: (serviceRevenue._sum.totalCost || 0) + (digitalRevenue._sum.amount || 0), 
            pendingOrders: pendingOrders + pendingDigital 
        };
    });

    const { rate } = await paymentService.convertToIDR(1);
    const revenueIDR = stats.revenue * rate;

    return (
        <div className="flex flex-col gap-6 w-full py-6">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-4">{t("title")}</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-zinc-900/40 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-12 h-12 text-emerald-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">{t("revenue")}</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <div className="text-3xl font-black text-white tracking-tighter">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.revenue)}
                            </div>
                            <div className="text-sm font-bold text-zinc-500 mt-1">
                                ≈ {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(revenueIDR)}
                            </div>
                        </div>
                        <p className="text-[10px] text-emerald-500 mt-3 flex items-center font-bold uppercase tracking-widest">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {t("lifetime")}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-12 h-12 text-amber-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">{t("pending")}</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tighter">{stats.pendingOrders}</div>
                        <p className="text-[10px] text-amber-500 mt-3 font-bold uppercase tracking-widest">{t("needsAction")}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-6">
                <Link href="/admin/finance/orders" className="group">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{t("manageOrders")}</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500 max-w-md">{t("manageOrdersDesc")}</p>
                    </div>
                </Link>

                <Link href="/admin/finance/digital-orders" className="group">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-white group-hover:text-emerald-500 transition-colors">{t("digitalOrders")}</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500 max-w-md">{t("digitalOrdersDesc")}</p>
                    </div>
                </Link>

                <Link href="/admin/finance/quotes" className="group">
                    <div className="rounded-xl border border-white/5 bg-zinc-900/20 p-6 hover:bg-zinc-900/40 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-white group-hover:text-brand-yellow transition-colors">{t("quotes")}</h3>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-zinc-500 max-w-md">{t("quotesDesc")}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
