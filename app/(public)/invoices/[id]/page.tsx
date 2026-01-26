import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { InvoiceClientWrapper } from "@/components/invoice/invoice-client-wrapper";
import { ExtendedEstimate } from "@/lib/types";
import { stackServerApp } from "@/lib/stack";

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

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Auth Guard / Fetch User
    const user = await stackServerApp.getUser();
    const order = await getOrder(id);

    if (!order) notFound();

    const isPaid = order.status === 'settled' || order.status === 'paid';

    // Construct ExtendedEstimate from Order Data
    // We assume the project has an estimate attached
    const estimateData = order.project?.estimate;

    if (!estimateData) {
        return <div>Invoice data incomplete</div>;
    }

    const extendedEstimate: ExtendedEstimate = {
        ...estimateData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        screens: (estimateData.screens as any) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apis: (estimateData.apis as any) || [],
        service: estimateData.service
    };

    // User data for InvoiceDocument
    // If user is logged in and matches the order owner, use their details. 
    // Otherwise fallback to generic client.
    const isOwner = user?.id === order.userId;
    const userData = isOwner ? {
        displayName: user?.displayName || "Valued Client",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (user as any)?.email || "",
    } : {
        displayName: "Valued Client",
        email: "client@example.com"
    };

    // Fetch System Settings for Bank
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['bank_name', 'bank_account', 'bank_holder'] } }
    });
    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const bankDetails = {
        bank_name: getSetting('bank_name'),
        bank_account: getSetting('bank_account'),
        bank_holder: getSetting('bank_holder')
    };

    return (
        <main className="min-h-screen bg-black selection:bg-lime-500/30 pb-24">
            <SiteHeader />
            <div className="container mx-auto px-4 py-24 max-w-7xl">
                <InvoiceClientWrapper
                    order={order}
                    estimate={extendedEstimate}
                    user={userData}
                    isPaid={isPaid}
                    bankDetails={bankDetails}
                />
            </div>
        </main>
    );
}
