import { CheckoutForm } from "@/components/checkout/digital-checkout-form";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { notFound } from "next/navigation";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { ExtendedEstimate } from "@/lib/shared/types";

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

    // 1. Coba cari sebagai Digital Product
    const product = await prisma.product.findUnique({
        where: { id }
    });

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
            <div className="min-h-screen w-full bg-black relative flex items-center justify-center py-24 px-4 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 w-full flex justify-center">
                    <CheckoutForm
                        product={productData}
                        userId={userId}
                        userEmail={userEmail}
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
            where: { key: { in: ['bank_name', 'bank_account', 'bank_holder', 'usd_rate', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL'] } }
        });
        const getSetting = (key: string) => settings.find(s => s.key === key)?.value;
        const activeRate = parseInt(getSetting('usd_rate') || "15000");

        const bonuses = await prisma.marketingBonus.findMany({
            where: { isActive: true }
        });

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

        const bonusesData = bonuses.map(b => ({
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
                    />
                </div>
            </div>
        );
    }

    // 3. Jika ID tidak ditemukan di Product maupun Estimate -> 404
    notFound();
}
