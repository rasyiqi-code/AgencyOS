
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { notifyNewServiceOrder } from "@/lib/email/admin-notifications";

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { serviceId, selectedAddons = [] } = body;

        if (!serviceId) {
            return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
        }

        // Fetch service details for titles
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

        const isQuoteOnly = (service as Record<string, unknown>).priceType === "STARTING_AT";

        // Calculate addons
        let addonsTotal = 0;
        let hasRecurringAddon = false;
        let addonsSummary = "";

        if (selectedAddons && selectedAddons.length > 0) {
            selectedAddons.forEach((addon: { price: number, interval?: string, currency?: string, name: string }) => {
                addonsTotal += addon.price;
                if (addon.interval && addon.interval !== "one_time") {
                    hasRecurringAddon = true;
                }
                const currencySymbol = (addon.currency || (service as unknown as { currency?: string }).currency) === 'IDR' ? 'Rp' : '$';
                addonsSummary += `\n- + ${addon.name} (${currencySymbol}${addon.price} ${addon.interval === "monthly" ? "Monthly" : addon.interval === "yearly" ? "Yearly" : "One-time"})`;
            });
        }

        const finalPrice = service.price + addonsTotal;
        const willBeSubscription = service.interval !== 'one_time' || hasRecurringAddon;

        // Create Project Placeholder
        const project = await prisma.project.create({
            data: {
                userId: user.id,
                clientName: user.displayName || user.primaryEmail || "Unnamed Client",
                title: isQuoteOnly ? `Quote Request: ${service.title}` : `Order: ${service.title}`,
                description: isQuoteOnly
                    ? `Requesting a custom quote for ${service.title}${addonsSummary ? '\nAdd-ons:' + addonsSummary : ''}`
                    : `Purchase of ${service.title} (${service.interval})${addonsSummary ? '\nAdd-ons:' + addonsSummary : ''}`,
                status: isQuoteOnly ? 'draft' : 'payment_pending',
                serviceId: service.id,
                totalAmount: finalPrice,
                // If recurring, start tracking subscription status
                ...(willBeSubscription ? {
                    subscriptionStatus: 'pending',
                } : {})
            }
        });

        // Create Invoice (Estimate)
        const estimate = await prisma.estimate.create({
            data: {
                title: isQuoteOnly ? `Quote: ${service.title}` : `Invoice: ${service.title}`,
                prompt: isQuoteOnly ? "Custom Quote Request" : "Productized Service Purchase",
                summary: isQuoteOnly 
                    ? `Custom quote request for ${service.title}${addonsSummary ? '\n\nAdd-ons:' + addonsSummary : ''}` 
                    : `${service.title}${addonsSummary ? '\n\nAdd-ons:' + addonsSummary : ''}`,
                screens: [],
                apis: [],
                totalHours: 0,
                totalCost: finalPrice,
                complexity: willBeSubscription ? 'Subscription' : 'Fixed',
                status: isQuoteOnly ? 'draft' : 'pending_payment',
                serviceId: service.id,
                project: {
                    connect: { id: project.id }
                }
            }
        });

        // Link back 
        await prisma.project.update({
            where: { id: project.id },
            data: { estimateId: estimate.id }
        });

        // Notify Admin
        notifyNewServiceOrder({
            clientName: user.displayName || user.primaryEmail || "Client",
            serviceTitle: service.title,
            estimateId: estimate.id,
            price: service.price
        }).catch(err => console.error("Failed to send admin notification:", err));

        return NextResponse.json({ url: `/checkout/${estimate.id}` });
    } catch (error) {
        console.error("Create Service Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
