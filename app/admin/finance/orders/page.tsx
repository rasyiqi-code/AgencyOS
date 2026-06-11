import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { type StackUser } from "@/lib/shared/types";
import { ShoppingCart } from "lucide-react";
import { FinanceList } from "@/components/admin/finance/finance-list";
import { FinanceData } from "@/components/admin/finance/finance-columns";
import { getTranslations } from "next-intl/server";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";

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
                description: project.description,
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
    // ⚡ Bolt Optimization: Only fetch users that are missing a valid clientName natively
    const missingClientNameOrders = orders.filter(o => {
        const project = o.project as { userId?: string | null; clientName?: string | null } | null;
        return o.userId && (!project || !project.clientName || project.clientName === "Client");
    });

    const uniqueUserIds = Array.from(new Set(
        missingClientNameOrders.map(o => o.userId as string)
    ));

    const stackUsers = await Promise.all(
        uniqueUserIds.map(async (id) => {
            try {
                return await hexclaveServerApp.getUser(id);
            } catch (e) {
                console.error(`Failed to fetch user ${id}`, e);
                return null;
            }
        })
    );
    const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u as StackUser]));

    // 3. Enrich Data
    const enrichedData = financeData.map(item => {
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
            <AdminHeaderSetter
                title={t("title")}
                actions={
                    orders.length > 0 ? (
                        <div className="relative p-2 rounded-xl bg-zinc-900 border border-white/5 shrink-0 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-zinc-400" />
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-black">
                                {orders.length}
                            </span>
                        </div>
                    ) : null
                }
            />


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
