import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { type StackUser } from "@/lib/shared/types";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FinanceList } from "@/components/admin/finance/finance-list";
import { FinanceData } from "@/components/admin/finance/finance-columns";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const t = await getTranslations("Admin.Finance");

    // Ambil data langsung dari ORDER sebagai sumber kebenaran utama
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                include: {
                    estimate: {
                        include: {
                            service: true
                        }
                    },
                    service: true
                }
            }
        }
    });

    // 1. Initial Mapping dari Order
    const financeData: FinanceData[] = orders.map(o => {
        // Prisma includes project with estimate & service
        const project = o.project;
        const estimate = (project as Record<string, unknown>)?.estimate as Record<string, unknown> | null;
        const service = ((project as Record<string, unknown>)?.service || estimate?.service) as Record<string, unknown> | null;

        return {
            id: o.id,
            createdAt: o.createdAt,
            status: o.status as FinanceData['status'],
            title: (project?.title || (estimate?.title as string) || (service?.title as string) || "Untitled Transaction") as string,
            totalCost: o.amount,
            proofUrl: o.proofUrl || null,
            service: service ? {
                id: service.id as string,
                title: service.title as string,
                currency: (service.currency as string) || 'USD'
            } : null,
            project: project ? {
                id: project.id,
                title: project.title,
                clientName: project.clientName,
                userId: project.userId,
                paymentStatus: project.paymentStatus,
                paidAmount: project.paidAmount,
                totalAmount: project.totalAmount,
                order: {
                    proofUrl: o.proofUrl,
                    paymentType: o.type,
                    paymentMethod: o.paymentType,
                    paymentMetadata: (o.paymentMetadata as Record<string, unknown>) || null
                }
            } : null,
            paymentType: o.type || null,
            paymentMethod: o.paymentType || null,
            paymentMetadata: (o.paymentMetadata as Record<string, unknown>) || null,
            currency: o.currency || 'USD',
            isLegacyMismatched: o.currency === 'IDR' && o.amount < 5000,
            exchangeRate: o.exchangeRate && o.exchangeRate !== 1 ? o.exchangeRate : undefined,
            transactionAmount: o.amount,
            screens: (estimate?.screens || []) as FinanceData['screens'],
            apis: (estimate?.apis || []) as FinanceData['apis'],
            estimateId: estimate?.id || null
        } as FinanceData;
    });

    // 2. Stack Auth User Resolution
    // Collect specific IDs dari orders
    const uniqueUserIds = Array.from(new Set(
        orders.map(o => o.userId).filter(Boolean) as string[]
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
        if (item.project && item.project.userId && (item.project.clientName === "Client" || !item.project.clientName)) {
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
        <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
                            {t("revenue")}
                        </div>
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[9px] font-medium px-2 py-0">
                            {t("financials")}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-4 group">
                        {t("title")}
                        <div className="relative p-2 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                            <ShoppingCart className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                            {orders.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-black">
                                    {orders.length}
                                </span>
                            )}
                        </div>
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-xl leading-relaxed">
                        {t("description")}
                    </p>
                </div>
            </div>


            <FinanceList data={enrichedData} />

            <div className="mt-8 flex items-center justify-between text-[11px] text-zinc-600 px-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t("autoSync")}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {t("pendingUpdates")}</span>
                </div>
            </div>
        </div>
    );
}
