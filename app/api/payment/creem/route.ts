import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { creem as getCreem } from "@/lib/integrations/creem";
import { hexclaveServerApp } from "@/lib/config/hexclave";


export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya user login yang boleh initiate payment
        const user = await hexclaveServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
        }

        let amount = 0;
        let creemProductIdFromService = null;
        let paymentMetadata: Record<string, unknown> = {};
        let orderUserId = "";

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                project: {
                    include: { service: true }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        amount = order.amount;
        creemProductIdFromService = (order.project?.service as { creemProductId?: string | null })?.creemProductId;
        paymentMetadata = (order.paymentMetadata as unknown as Record<string, unknown>) || {};
        orderUserId = order.userId;

        // Ownership check: pastikan order milik user yang sedang login
        if (orderUserId && orderUserId !== user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        let productId = "";

        // 1. CHECK: Has a dynamic product already been created for this Order? (Use Metadata)
        if ((paymentMetadata as Record<string, string>).creemProductId) {
            productId = (paymentMetadata as Record<string, string>).creemProductId as string;
        }
        // 2. CHECK: Use synced Creem Product ID if available (Official Services)
        else if (creemProductIdFromService) {
            productId = creemProductIdFromService;
        }
        else {
            // FALLBACK: Create a NEW dynamic product
            const { resetCreemInstance } = await import("@/lib/integrations/creem");
            resetCreemInstance(); // Safety: Ensure fresh config

            const creem = await getCreem();
            const product = await creem.products.create({
                name: `Invoice #${orderId.slice(-8).toUpperCase()}`,
                description: `Payment for Order #${orderId}`,
                price: Math.round(amount * 100), // Convert to cents
                currency: "USD",
                billingType: "onetime", // CamelCase
                taxMode: "inclusive", // CamelCase
                taxCategory: "digital-goods-service" // CamelCase
            });
            productId = product.id;

            // SAVE IT to Order Metadata so next time we reuse it!
            const updateData = {
                paymentMetadata: {
                    ...paymentMetadata,
                    creemProductId: productId
                }
            };

            await prisma.order.update({
                where: { id: orderId },
                data: updateData
            });
        }

        // 2. Create Checkout Session
        const creem = await getCreem();
        const checkout = await creem.checkouts.create({
            productId: productId, // CamelCase
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/status?orderId=${orderId}`, // CamelCase
            metadata: {
                orderId: orderId
            },
        });

        // Ensure we don't pass undefined to Prisma (even though it's usually fine, let's be explicit)
        const finalUpdate: { paymentType: string; transactionId?: string } = { 
            paymentType: "creem",
            transactionId: checkout.id
        };

        await prisma.order.update({
            where: { id: orderId },
            data: finalUpdate
        });

        return NextResponse.json({ checkout_url: checkout.checkoutUrl });

    } catch (error: unknown) {
        console.error("[CREEM_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { message: (error instanceof Error ? error.message : "Unknown error") || "Failed to initiate Creem payment" },
            { status: 500 }
        );
    }
}
