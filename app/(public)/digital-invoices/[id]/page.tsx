import { prisma } from "@/lib/config/db";
import { notFound } from "next/navigation";
import { stackServerApp } from "@/lib/config/stack";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { DigitalInvoiceClientWrapper } from "@/components/invoice/digital-invoice-client-wrapper";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/**
 * Halaman Invoice Produk Digital (Refined UI)
 * Menggunakan DigitalInvoiceClientWrapper untuk konsistensi tampilan dengan Invoice Layanan.
 */
export default async function DigitalInvoicePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const user = await stackServerApp.getUser();

    const order = await prisma.digitalOrder.findUnique({
        where: { id },
        include: { product: true, license: true }
    });

    // Null check HARUS sebelum akses property order
    if (!order) return notFound();

    const orderUser = (order.userId && user && order.userId === user.id) ? {
        name: user.displayName,
        displayName: user.displayName,
        email: user.primaryEmail
    } : null;

    if (order.userId && order.userId !== user?.id) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-zinc-400">Anda tidak memiliki akses ke invoice ini.</p>
                    <Button variant="outline" asChild>
                        <a href="/dashboard">Ke Dashboard</a>
                    </Button>
                </div>
            </div>
        );
    }

    const isPaid = order.status === 'PAID';
    const hasActiveGateway = await paymentGatewayService.hasActiveGateway();

    const settings = await prisma.systemSetting.findMany({
        where: {
            key: {
                in: [
                    'bank_name', 'bank_account', 'bank_holder',
                    'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL'
                ]
            }
        }
    });
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
            <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
                <DigitalInvoiceClientWrapper
                    order={order}
                    isPaid={isPaid}
                    bankDetails={bankDetails}
                    agencySettings={agencySettings}
                    hasActiveGateway={hasActiveGateway}
                    userMethod={orderUser}
                />
            </div>
        </div>
    );
}
