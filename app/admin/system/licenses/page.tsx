import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { prisma } from "@/lib/config/db";
import { LicenseClient } from "./license-client";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
    if (!await isAdmin()) {
        redirect("/dashboard");
    }

    // Ambil data produk software jadi yang aktif untuk pilihan manual creation
    const products = await prisma.softwareProduct.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
    });

    return (
        <div className="w-full">
            <LicenseClient 
                initialProducts={products} 
            />
        </div>
    );
}
