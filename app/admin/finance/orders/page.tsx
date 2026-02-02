import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { type StackUser } from "@/lib/types";
import { ShoppingCart, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrdersDataTable } from "@/components/admin/finance/orders-data-table";
import { FinanceData, financeColumns } from "@/components/admin/finance/finance-columns";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const t = await getTranslations("Admin.Finance");
    const estimates = await prisma.estimate.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                include: { order: true }
            }
        }
    });

    const agencySetting = await prisma.systemSetting.findUnique({
        where: { key: "AGENCY_NAME" }
    });
    const agencyName = agencySetting?.value || "Agency OS";

    // 1. Initial Mapping
    const financeData: FinanceData[] = estimates.map(e => ({
        ...e,
        project: e.project ? {
            title: e.project.title,
            clientName: e.project.clientName,
            userId: e.project.userId,
            order: e.project.order ? {
                proofUrl: e.project.order.proofUrl,
                paymentType: e.project.order.paymentType
            } : null
        } : null,
        paymentType: e.project?.order?.paymentType || null,
        screens: e.screens as FinanceData['screens'],
        apis: e.apis as FinanceData['apis']
    }));

    // 2. Stack Auth User Resolution
    // Collect specific IDs from project relations
    const uniqueUserIds = Array.from(new Set(
        estimates
            .map(e => e.project?.userId)
            .filter(Boolean) as string[]
    ));

    const stackUsers = await Promise.all(
        uniqueUserIds.map(async (id) => {
            try {
                return await stackServerApp.getUser(id);
            } catch (e) {
                console.error(`Failed to fetch user ${id}`, e);
                return null;
            }
        })
    );
    const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u as StackUser]));

    // 3. Enrich Data
    const enrichedData = financeData.map(item => {
        // If project exists and has userId but missing clientName, enrich it
        if (item.project && item.project.userId && !item.project.clientName) {
            const u = userMap.get(item.project.userId);
            if (u) {
                return {
                    ...item,
                    project: {
                        ...item.project,
                        clientName: u.displayName || u.primaryEmail || "Unnamed Client"
                    }
                };
            }
        }
        return item;
    });

    return (
        <div className="w-full py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                            {t("revenue")}
                        </div>
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px] font-medium px-2 py-0">
                            {t("financials")}
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
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{t("totalProjects")}</span>
                        <span className="text-xl font-bold text-white tabular-nums">{estimates.length}</span>
                    </div>
                </div>
            </div>

            <OrdersDataTable columns={financeColumns} data={enrichedData} />

            <div className="mt-8 flex items-center justify-between text-[11px] text-zinc-600 px-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t("autoSync")}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {t("pendingUpdates")}</span>
                </div>
                <div className="flex items-center gap-2 italic">
                    <LayoutDashboard className="w-3 h-3" />
                    {t("poweredBy", { brand: agencyName })}
                </div>
            </div>
        </div>
    );
}

