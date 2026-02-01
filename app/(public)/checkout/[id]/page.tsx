import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { stackServerApp } from "@/lib/stack";
import { currencyService } from "@/lib/server/currency-service";

async function getEstimate(id: string) {
    return await prisma.estimate.findUnique({
        where: { id },
        include: { service: true }
    });
}

async function getBankSettings() {
    // Fetch all SystemSettings and reduce
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: ['bank_name', 'bank_account', 'bank_holder'] }
        }
    });

    // Convert array to object
    return settings.reduce((acc: Record<string, string>, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Auth Guard
    const user = await stackServerApp.getUser();
    if (!user) {
        redirect(`/handler/sign-in?after_auth_return_to=/checkout/${id}`);
    }

    const [estimate, bankDetails, exchangeRates] = await Promise.all([
        getEstimate(id),
        getBankSettings(),
        currencyService.getRates()
    ]);

    const bonuses = (await prisma.marketingBonus.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
    })).map(b => ({
        ...b,
        icon: b.icon || "",
        value: b.value || undefined
    }));

    // Default rate if fetch fails or is null (though convertToIDR has fallback, UI needs something)
    const activeRate = exchangeRates?.rates?.IDR || 16000;

    if (!estimate) notFound();

    // Sanitize JSON
    const sanitizedEstimate = {
        ...estimate,
        screens: (estimate.screens as unknown as { title: string, hours: number, description?: string }[] || []).map(s => ({ ...s, description: s.description || "" })),
        apis: (estimate.apis as unknown as { title: string, hours: number, description?: string }[] || []).map(a => ({ ...a, description: a.description || "" }))
    };



    return (
        <div className="container mx-auto px-4 py-12">
            <CheckoutContent estimate={sanitizedEstimate} bankDetails={bankDetails} activeRate={activeRate} bonuses={bonuses} />
        </div>
    );
}
