import { prisma } from "@/lib/config/db";

import { LicenseList } from "@/components/admin/licenses/license-list";
import { LicenseGenerator } from "@/components/admin/licenses/license-generator";
import { LicenseStats } from "@/components/admin/licenses/license-stats";
import { LicenseIntegrationGuide } from "@/components/admin/licenses/integration-guide";
import { Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
    // Include digitalOrder untuk info pembeli (email, nama)
    const licenses = await (prisma as any).license.findMany({
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

    const policies = await prisma.product.findMany({ select: { id: true } }); // optimization

    const totalLicenses = await prisma.license.count();
    const activeLicenses = await prisma.license.count({ where: { status: 'active' } });
    const licensedProducts = await prisma.license.groupBy({
        by: ['productId'],
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Key className="w-8 h-8 text-brand-yellow" />
                        License Management
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Generate and manage API keys for your products.
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
