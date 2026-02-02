import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { InvoiceClientWrapper } from "@/components/invoice/invoice-client-wrapper";
import { ExtendedEstimate } from "@/lib/types";
import { stackServerApp } from "@/lib/stack";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import type { InvoiceOrder } from "@/types/payment";

async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            project: {
                include: {
                    service: true,
                    estimate: {
                        include: { service: true }
                    }
                }
            }
        }
    });
}

export default async function PublicInvoicePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { params } = props;
    const { id } = await params;

    const searchParams = (props.searchParams) ? await props.searchParams : {};
    const token = searchParams.token as string | undefined;

    // Auth Guard / Fetch User
    const user = await stackServerApp.getUser();
    const order = await getOrder(id);

    if (!order) notFound();

    const isOwner = user?.id === order.userId;
    // Allow if owner OR if token matches (for public sharing)
    const isAuthorized = isOwner || (token && token === order.snapToken);

    if (!isAuthorized) {
        // Render simple forbidden or 404 to block access
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-zinc-400">You do not have permission to view this invoice.</p>
                </div>
            </div>
        );
    }

    const isPaid = order.status === 'settled' || order.status === 'paid';

    // Construct ExtendedEstimate from Order Data
    // We assume the project has an estimate attached
    const estimateData = order.project?.estimate;

    if (!estimateData) {
        return <div>Invoice data incomplete</div>;
    }

    const extendedEstimate: ExtendedEstimate = {
        ...estimateData,
        screens: (estimateData.screens as unknown) as ExtendedEstimate['screens'],
        apis: (estimateData.apis as unknown) as ExtendedEstimate['apis'],
        service: estimateData.service
    };

    // User data for InvoiceDocument
    // If user is logged in and matches the order owner, use their details. 
    // Otherwise fallback to generic client.

    const userData = isOwner ? {
        displayName: user?.displayName || "Valued Client",
        email: user?.primaryEmail || "",
    } : {
        displayName: "Valued Client",
        email: "client@example.com"
    };

    // Fetch System Settings for Bank and Agency
    const [settings, hasActiveGateway] = await Promise.all([
        prisma.systemSetting.findMany({
            where: { key: { in: ['bank_name', 'bank_account', 'bank_holder', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL'] } }
        }),
        paymentGatewayService.hasActiveGateway()
    ]);
    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const bankDetails = {
        bank_name: getSetting('bank_name'),
        bank_account: getSetting('bank_account'),
        bank_holder: getSetting('bank_holder')
    };

    const agencySettings = {
        agencyName: getSetting('AGENCY_NAME') || "Agency OS",
        companyName: getSetting('COMPANY_NAME') || "Agency OS",
        address: getSetting('CONTACT_ADDRESS') || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000",
        email: getSetting('CONTACT_EMAIL') || "billing@crediblemark.com"
    };

    return (
        <div className="min-h-screen bg-black selection:bg-lime-500/30 pb-24">
            <div className="container mx-auto px-4 py-24 max-w-7xl">
                <InvoiceClientWrapper
                    order={order as unknown as InvoiceOrder}
                    estimate={extendedEstimate}
                    user={userData}
                    isPaid={isPaid}
                    bankDetails={bankDetails}
                    agencySettings={agencySettings}
                    hasActiveGateway={hasActiveGateway}
                />
            </div>
        </div>
    );
}
