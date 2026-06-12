export const dynamic = "force-dynamic";

import { CheckoutPortal } from "@/components/checkout/checkout-portal";
import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { notFound, redirect } from "next/navigation";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { ExtendedEstimate } from "@/lib/shared/types";
import { getBonuses } from "@/lib/server/marketing";
import { Bonus } from "@/lib/shared/types";
import { SystemSetting } from "@prisma/client";
import { getSystemSettings } from "@/lib/server/settings";


interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Halaman Checkout Unified.
 * Menangani checkout Service/Estimate (via Estimate ID) untuk Agensi Jasa.
 */
export default async function CheckoutPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const searchParams = await props.searchParams;
    const paymentType = typeof searchParams.paymentType === 'string' ? (searchParams.paymentType as "FULL" | "DP" | "REPAYMENT") : undefined;

    const { paymentService } = await import("@/lib/server/payment-service");
    const activeRate = await paymentService.getExchangeRate();

    // Fetch user and enforce login for all checkout types
    const user = await hexclaveServerApp.getUser().catch(() => null);

    if (!user) {
        // Enforce Login to ensure we have user identity
        redirect(`/handler/sign-in?after_auth_return_to=${encodeURIComponent(`/checkout/${id}`)}`);
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
        const settings = await getSystemSettings(['bank_name', 'bank_account', 'bank_holder', 'manual_payment_active', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM']);

        const getSetting = (key: string) => settings.find((s: SystemSetting) => s.key === key)?.value;

        const context = (estimate.prompt === "Instant Quote Calculator" || !estimate.serviceId) ? "CALCULATOR" : "SERVICE";
        const bonuses = await getBonuses(context);

        const gatewayStatus = await paymentGatewayService.getGatewayStatus();
        const hasActiveGateway = gatewayStatus.midtrans || gatewayStatus.creem;

        const isManualActive = getSetting('manual_payment_active') === 'true';
        const bankDetails = isManualActive ? {
            bank_name: getSetting('bank_name'),
            bank_account: getSetting('bank_account'),
            bank_holder: getSetting('bank_holder')
        } : undefined;

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
                    // ⚡ Bolt Optimization: Use hexclaveServerApp.getUser() instead of listUsers() array lookup
                    // 🎯 Why: Avoids O(N) network payload and memory overhead when fetching a single user.
                    // 📊 Impact: O(1) performance lookup and reduced API latency.
                    const owner = await hexclaveServerApp.getUser(estimate.project.userId);
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
            <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 pb-6">
                <div className="max-w-7xl mx-auto px-6 py-4 md:py-8 w-full">
                    <CheckoutPortal
                        estimate={extendedEstimate}
                        bankDetails={bankDetails}
                        activeRate={activeRate}
                        bonuses={bonusesDataForEstimate}
                        user={userData}
                        agencySettings={agencySettings}
                        hasActiveGateway={hasActiveGateway}
                        gatewayStatus={gatewayStatus}
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
