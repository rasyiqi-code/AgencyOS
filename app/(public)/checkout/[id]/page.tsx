import { CheckoutContent } from "@/components/checkout/checkout-content";
import { DigitalCheckoutContent } from "@/components/checkout/digital-checkout-content";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { notFound } from "next/navigation";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { ExtendedEstimate } from "@/lib/shared/types";
import { getBonuses } from "@/lib/server/marketing";
import { Bonus } from "@/lib/shared/types";
import { SystemSetting } from "@prisma/client";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Halaman Checkout Unified.
 * Menangani dua jenis checkout:
 * 1. Digital Product (via Product ID)
 * 2. Service/Estimate (via Estimate ID) - Legacy/Existing Flow
 */
export default async function CheckoutPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const searchParams = await props.searchParams;
    const paymentType = typeof searchParams.paymentType === 'string' ? (searchParams.paymentType as "FULL" | "DP" | "REPAYMENT") : undefined;

    const { currencyService } = await import("@/lib/server/currency-service");
    const exchangeRates = await currencyService.getRates();
    const activeRate = exchangeRates?.rates.IDR || 15000;

    const product = await prisma.product.findUnique({
        where: { id }
    });

    const bonuses = await getBonuses("DIGITAL");

    const bonusesData = bonuses.map((b: Bonus) => ({
        ...b,
        icon: b.icon || "Check",
        value: b.value || "",
        description: b.description || ""
    }));

    // Jika Product ditemukan dan aktif, render Digital Checkout (New Flow)
    if (product && product.isActive) {
        let userId: string | undefined;
        let userEmail: string | undefined;
        try {
            const user = await stackServerApp.getUser();
            if (user) {
                userId = user.id;
                userEmail = user.primaryEmail || undefined;
            }
        } catch {
            // Guest mode
        }

        const p = product;
        const productData = {
            id: p.id,
            name: p.name,
            price: p.price,
            purchaseType: (p.purchaseType as "one_time" | "subscription") || "one_time",
            interval: p.interval || undefined,
        };

        return (
            <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 pb-24">
                <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
                    <DigitalCheckoutContent
                        product={productData}
                        bonuses={bonusesData}
                        userId={userId}
                        userEmail={userEmail}
                        activeRate={activeRate}
                    />
                </div>
            </div>
        );
    }

    // 2. Jika Product tidak ditemukan, cari sebagai Service Estimate (Legacy Flow)
    const estimate = await prisma.estimate.findUnique({
        where: { id },
        include: { service: true, project: true }
    });

    // Jika Estimate ditemukan, render Service Checkout Flow (Legacy)
    if (estimate) {
        // Fetch dependencies for Service Checkout
        const user = await stackServerApp.getUser();

        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: ['bank_name', 'bank_account', 'bank_holder', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL'] } }
        });
        const getSetting = (key: string) => settings.find((s: SystemSetting) => s.key === key)?.value;

        const context = (estimate.prompt === "Instant Quote Calculator" || !estimate.serviceId) ? "CALCULATOR" : "SERVICE";
        const bonuses = await getBonuses(context);

        const hasActiveGateway = await paymentGatewayService.hasActiveGateway();

        // Data preparation
        const bankDetails = {
            bank_name: getSetting('bank_name'),
            bank_account: getSetting('bank_account'),
            bank_holder: getSetting('bank_holder')
        };

        const agencySettings = {
            agencyName: getSetting('AGENCY_NAME') || "Agency OS",
            companyName: getSetting('COMPANY_NAME') || "Agency OS",
            address: getSetting('CONTACT_ADDRESS') || "Tech Valley\nCyberjaya, Malaysia",
            email: getSetting('CONTACT_EMAIL') || "billing@agencyos.com"
        };

        // Construct ExtendedEstimate
        const extendedEstimate: ExtendedEstimate = {
            ...estimate,
            screens: (estimate.screens as unknown) as ExtendedEstimate['screens'],
            apis: (estimate.apis as unknown) as ExtendedEstimate['apis'],
            service: estimate.service
        };

        const bonusesData = bonuses.map((b: Bonus) => ({
            ...b,
            icon: b.icon || "Check",
            value: b.value || "",
            description: b.description || ""
        }));

        const userData = {
            displayName: user?.displayName || "Valued Client",
            email: user?.primaryEmail || "",
        };

        return (
            <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 pb-24">
                <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
                    <CheckoutContent
                        estimate={extendedEstimate}
                        bankDetails={bankDetails}
                        activeRate={activeRate}
                        bonuses={bonusesData}
                        user={userData}
                        agencySettings={agencySettings}
                        hasActiveGateway={hasActiveGateway}
                        defaultPaymentType={paymentType}
                        projectPaidAmount={estimate.project?.paidAmount || 0}
                        projectTotalAmount={estimate.project?.totalAmount || estimate.totalCost}
                        context={context}
                    />
                </div>
            </div>
        );
    }

    // 3. Jika ID tidak ditemukan di Product maupun Estimate -> 404
    notFound();
}
