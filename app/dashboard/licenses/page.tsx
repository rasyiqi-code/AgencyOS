import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { getUserLicenses } from "@/app/actions/licenses";
import { prisma } from "@/lib/config/db";
import { UserLicenseClient } from "./user-license-client";

export const dynamic = "force-dynamic";

export default async function UserLicensesPage() {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
        redirect("/login");
    }

    // Ambil lisensi milik user
    const licenses = await getUserLicenses();

    // Ambil katalog produk software jadi yang aktif untuk dibeli
    const products = await prisma.softwareProduct.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
    });

    return (
        <div className="w-full">
            <UserLicenseClient 
                initialLicenses={licenses} 
                availableProducts={products} 
            />
        </div>
    );
}
