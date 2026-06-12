import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { getUserLicenses } from "@/app/actions/licenses";
import { prisma } from "@/lib/config/db";
import { UserLicenseClient } from "./user-license-client";
import { getSystemSettings } from "@/lib/server/settings";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

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

    // Ambil pengaturan sistem pembayaran aktif
    const settings = await getSystemSettings([
        'bank_name', 
        'bank_account', 
        'bank_holder', 
        'manual_payment_active', 
        'CONTACT_PHONE', 
        'CONTACT_TELEGRAM'
    ]);

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const gatewayStatus = await paymentGatewayService.getGatewayStatus();
    const hasActiveGateway = gatewayStatus.midtrans || gatewayStatus.creem;

    const isManualActive = getSetting('manual_payment_active') === 'true';
    const bankDetails = isManualActive ? {
        bank_name: getSetting('bank_name') || "",
        bank_account: getSetting('bank_account') || "",
        bank_holder: getSetting('bank_holder') || ""
    } : null;

    const contactWA = getSetting('CONTACT_PHONE') || null;
    const contactTele = getSetting('CONTACT_TELEGRAM') || null;

    const userData = {
        displayName: user.displayName || "Client",
        email: user.primaryEmail || "",
    };

    return (
        <div className="w-full">
            <UserLicenseClient 
                initialLicenses={licenses} 
                availableProducts={products} 
                bankDetails={bankDetails || undefined}
                gatewayStatus={gatewayStatus}
                hasActiveGateway={hasActiveGateway}
                contactWA={contactWA}
                contactTele={contactTele}
                user={userData}
            />
        </div>
    );
}
