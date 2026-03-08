import { prisma } from "@/lib/config/db";
import { canManageBilling } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { DigitalOrderList, type DigitalOrderWithRelations } from "@/components/admin/finance/digital-order-list";
import { ShoppingCart } from "lucide-react";
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

    // const agencySetting = await prisma.systemSetting.findUnique({
    //     where: { key: "AGENCY_NAME" }
    // });
    // const agencyName = agencySetting?.value || "Agency OS";

    return (
        <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-6">
                <div className="space-y-1.5 text-left">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        {t("title")}
                        <ShoppingCart className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-1.5 text-sm max-w-xl leading-relaxed">
                        {t("description")}
                    </p>
                </div>
            </div>

            <DigitalOrderList orders={orders as unknown as DigitalOrderWithRelations[]} />

            <div className="mt-8 flex items-center justify-between text-[11px] text-zinc-600 px-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {tf("autoSync")}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {tf("pendingUpdates")}</span>
                </div>
                {/* Powered by text removed */}
            </div>
        </div>
    );
}
