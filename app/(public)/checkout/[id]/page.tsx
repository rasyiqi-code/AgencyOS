import { CheckoutContent } from "@/components/checkout/checkout-content";
import { DigitalCheckoutContent } from "@/components/checkout/digital-checkout-content";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { notFound, redirect } from "next/navigation";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { ExtendedEstimate } from "@/lib/shared/types";
import { getBonuses } from "@/lib/server/marketing";
import { Bonus } from "@/lib/shared/types";
import { SystemSetting } from "@prisma/client";
import { getSystemSettings } from "@/lib/server/settings";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";

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

    // Fetch user and enforce login for all checkout types
    const user = await stackServerApp.getUser().catch(() => null);

    if (!user) {
        // Enforce Login for all Checkout flows to ensure we have user identity
        redirect(`/handler/sign-in?after_auth_return_to=${encodeURIComponent(`/checkout/${id}`)}`);
    }

    const userId = user.id;
    const userEmail = user.primaryEmail || undefined;

    // 1. Jika Product ditemukan dan aktif, render Digital Checkout (New Flow)
    if (product && product.isActive) {
        const p = product;
        const productData = {
            id: p.id,
            name: p.name,
            price: p.price,
            purchaseType: (p.purchaseType as "one_time" | "subscription") || "one_time",
            interval: p.interval || undefined,
            description: p.description,
            description_id: p.description_id,
        };

        return (
            <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 pb-24">
                <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
                    <CheckoutProgress currentStep={1} />
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
        // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct DB query to avoid N+1 query and reduce database load
        // 🎯 Why: This page is frequently accessed during checkout. Caching system settings reduces database queries.
        // 📊 Impact: Eliminates 1 database query per checkout page load for legacy estimate flow.
        const settings = await getSystemSettings(['bank_name', 'bank_account', 'bank_holder', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM']);

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
            email: getSetting('CONTACT_EMAIL') || "billing@agencyos.com",
            phone: getSetting('CONTACT_PHONE'),
            telegram: getSetting('CONTACT_TELEGRAM')
        };

        // Construct ExtendedEstimate
        const extendedEstimate: ExtendedEstimate = {
            ...estimate,
            screens: (estimate.screens as unknown) as ExtendedEstimate['screens'],
            apis: (estimate.apis as unknown) as ExtendedEstimate['apis'],
            service: estimate.service ? {
                ...estimate.service,
                priceType: (estimate.title.includes("Draft Quote") || estimate.title.startsWith("Quote:")) ? "STARTING_AT" : (estimate.service as Record<string, unknown>).priceType as string
            } : null
        };

        const bonusesDataForEstimate = bonuses.map((b: Bonus) => ({
            ...b,
            icon: b.icon || "Check",
            value: b.value || "",
            description: b.description || ""
        }));

        // Determine display user data for the invoice
        // If it's a manual quote or linked to a project, prioritize the project/estimate owner info
        const userData = {
            displayName: estimate.project?.clientName || user?.displayName || "Valued Client",
            email: "", // Default to empty to avoid showing admin's email on client's invoice
        };

        if (estimate.project?.userId) {
            if (estimate.project.userId === 'OFFLINE') {
                // Handle Offline Client
                // Extract contact (email/phone) from summary if possible: "Custom quote for Name (contact)"
                const emailMatch = estimate.summary.match(/\(([^)]+)\)/);
                if (emailMatch) {
                    userData.email = emailMatch[1];
                }
            } else if (estimate.project.userId !== user?.id) {
                // If the logged-in user is NOT the owner (e.g. Admin Preview), fetch owner info
                try {
                    const allUsers = await stackServerApp.listUsers({ limit: 100 });
                    const owner = allUsers.find(u => u.id === estimate.project?.userId);
                    if (owner) {
                        userData.displayName = owner.displayName || owner.primaryEmail || estimate.project.clientName || "Valued Client";
                        userData.email = owner.primaryEmail || "";
                    }
                } catch (e) {
                    console.error("Failed to fetch estimate owner for invoice:", e);
                }
            } else {
                // Logged in user IS the owner
                userData.email = user.primaryEmail || "";
            }
        } else {
            // No project (Instant Calculator flow), use current logged-in user
            userData.email = user?.primaryEmail || "";
        }

        return (
            <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 pb-24">
            <div className="container mx-auto px-4 py-8 md:py-24 max-w-7xl">
                    <CheckoutProgress currentStep={estimate.status === 'paid' ? 4 : 1} />
                    <CheckoutContent
                        estimate={extendedEstimate}
                        bankDetails={bankDetails}
                        activeRate={activeRate}
                        bonuses={bonusesDataForEstimate}
                        user={userData}
                        agencySettings={agencySettings}
                        hasActiveGateway={hasActiveGateway}
                        defaultPaymentType={paymentType}
                        projectPaidAmount={estimate.project?.paidAmount || 0}
                        projectTotalAmount={estimate.project?.totalAmount || estimate.totalCost}
                        context={context}
                        orderId={estimate.project?.invoiceId}
                    />
                </div>
            </div>
        );
    }

    // 3. Jika ID tidak ditemukan di Product maupun Estimate -> 404
    notFound();
}
