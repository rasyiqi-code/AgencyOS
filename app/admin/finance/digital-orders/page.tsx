import { prisma } from "@/lib/config/db";
import { canManageBilling } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { DigitalOrderList, type DigitalOrderWithRelations } from "@/components/admin/finance/digital-order-list";
import { ShoppingCart, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminDigitalOrdersPage() {
    const t = await getTranslations("Admin.Finance.DigitalOrders");
    const tf = await getTranslations("Admin.Finance");

    const hasAccess = await canManageBilling();
    if (!hasAccess) {
        redirect('/dashboard');
    }

    const orders = await prisma.digitalOrder.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            userName: true,
            userEmail: true,
            amount: true,
            status: true,
            createdAt: true,
            paymentType: true,
            paymentMetadata: true,
            licenseId: true,
            proofUrl: true,
            product: {
                select: {
                    name: true,
                    type: true,
                }
            }
        }
    });

    const agencySetting = await prisma.systemSetting.findUnique({
        where: { key: "AGENCY_NAME" }
    });
    const agencyName = agencySetting?.value || "Agency OS";

    return (
        <div className="w-full py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                            {tf("revenue")}
                        </div>
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px] font-medium px-2 py-0">
                            {tf("financials")}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-4 group">
                        {t("title")}
                        <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                            <ShoppingCart className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-xl leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="flex flex-col items-end px-4 py-2 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Total Orders</span>
                        <span className="text-xl font-bold text-white tabular-nums">{orders.length}</span>
                    </div>
                </div>
            </div>

            <DigitalOrderList orders={orders as unknown as DigitalOrderWithRelations[]} />

            <div className="mt-8 flex items-center justify-between text-[11px] text-zinc-600 px-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {tf("autoSync")}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {tf("pendingUpdates")}</span>
                </div>
                <div className="flex items-center gap-2 italic">
                    <LayoutDashboard className="w-3 h-3" />
                    {tf("poweredBy", { brand: agencyName })}
                </div>
            </div>
        </div>
    );
}
