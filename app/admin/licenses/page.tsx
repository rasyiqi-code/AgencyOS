import { prisma } from "@/lib/config/db";

import { LicenseList } from "@/components/admin/licenses/license-list";
import { LicenseGenerator } from "@/components/admin/licenses/license-generator";
import { LicenseStats } from "@/components/admin/licenses/license-stats";
import { LicenseIntegrationGuide } from "@/components/admin/licenses/integration-guide";
import { Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
    // Include digitalOrder untuk info pembeli (email, nama)
    const licenses = await prisma.license.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            product: {
                select: { name: true, slug: true }
            },
            digitalOrder: {
                select: { userEmail: true, userName: true, status: true }
            }
        }
    });

    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
    });

    // const policies = await prisma.product.findMany({ select: { id: true } }); // optimization

    const totalLicenses = await prisma.license.count();
    const activeLicenses = await prisma.license.count({ where: { status: 'active' } });
    const licensedProducts = await prisma.license.groupBy({
        by: ['productId'],
    });

    return (
        <div className="w-full py-1 md:py-4 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Key className="w-5 h-5 md:w-6 md:h-6 text-brand-yellow" />
                        Licenses
                    </h1>
                    <p className="text-zinc-500 font-medium text-[10px] md:text-sm">
                        Manage API keys and product activations.
                    </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <LicenseIntegrationGuide />
                    <LicenseGenerator products={products} />
                </div>
            </div>

            <LicenseStats
                totalLicenses={totalLicenses}
                activeLicenses={activeLicenses}
                totalProducts={licensedProducts.length}
            />

            <LicenseList licenses={licenses} />
        </div>
    );
}
