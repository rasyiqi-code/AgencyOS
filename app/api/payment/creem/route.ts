import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { creem as getCreem } from "@/lib/integrations/creem";
import { stackServerApp } from "@/lib/config/stack";
import type { CreemPaymentMetadata } from "@/types/payment";

export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya user login yang boleh initiate payment
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
        }

        const isDigital = orderId.startsWith("DIGI-");
        let amount = 0;
        let title = "";
        let creemProductIdFromService = null;
        let paymentMetadata: any = {};
        let orderUserId = "";

        if (isDigital) {
            const digitalOrder = await prisma.digitalOrder.findUnique({
                where: { id: orderId },
                include: { product: true }
            });

            if (!digitalOrder) {
                return NextResponse.json({ message: "Digital Order not found" }, { status: 404 });
            }

            amount = digitalOrder.amount;
            title = digitalOrder.product.name;
            paymentMetadata = digitalOrder.paymentMetadata || {};
            orderUserId = digitalOrder.userId || "";
        } else {
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
            title = order.project?.service?.title || order.project?.title || "Project Payment";
            creemProductIdFromService = (order.project?.service as any)?.creemProductId;
            paymentMetadata = order.paymentMetadata || {};
            orderUserId = order.userId;
        }

        // Ownership check: pastikan order milik user yang sedang login
        if (orderUserId && orderUserId !== user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        let productId = "";

        // 1. CHECK: Has a dynamic product already been created for this Order? (Use Metadata)
        if (paymentMetadata.creemProductId) {
            productId = paymentMetadata.creemProductId;
            console.log("Reusing existing Dynamic Creem Product ID:", productId);
        }
        // 2. CHECK: Use synced Creem Product ID if available (Official Services)
        else if (creemProductIdFromService) {
            productId = creemProductIdFromService;
            console.log("Using synced Official Creem Product ID:", productId);
        }
        else {
            // 3. FALLBACK: Create a NEW dynamic product
            console.log("Creating NEW Dynamic Creem Product for Order:", orderId);
            const { resetCreemInstance } = await import("@/lib/integrations/creem");
            resetCreemInstance(); // Safety: Ensure fresh config

            const creem = await getCreem();
            const product = await creem.products.create({
                name: isDigital ? title : `Invoice #${orderId.slice(-8).toUpperCase()}`,
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

            if (isDigital) {
                await prisma.digitalOrder.update({
                    where: { id: orderId },
                    data: updateData
                });
            } else {
                await prisma.order.update({
                    where: { id: orderId },
                    data: updateData
                });
            }
            console.log("Saved new Dynamic Product ID to Order Metadata:", productId);
        }

        // 2. Create Checkout Session
        const creem = await getCreem();
        const checkout = await creem.checkouts.create({
            productId: productId, // CamelCase
            successUrl: isDigital
                ? `${process.env.NEXT_PUBLIC_APP_URL}/digital-invoices/${orderId}`
                : `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/status?orderId=${orderId}`, // CamelCase
            metadata: {
                orderId: orderId
            },

        });

        // 3. Update Order with Payment Type
        const updateData = {
            paymentType: "creem",
            paymentId: isDigital ? checkout.id : undefined, // Digital order uses paymentId for SDK transaction_id
            transactionId: !isDigital ? checkout.id : undefined, // Standard order uses transactionId
        };

        // Ensure we don't pass undefined to Prisma (even though it's usually fine, let's be explicit)
        const finalUpdate: any = { paymentType: "creem" };
        if (isDigital) finalUpdate.paymentId = checkout.id;
        else finalUpdate.transactionId = checkout.id;

        if (isDigital) {
            await prisma.digitalOrder.update({
                where: { id: orderId },
                data: finalUpdate
            });
        } else {
            await prisma.order.update({
                where: { id: orderId },
                data: finalUpdate
            });
        }

        return NextResponse.json({ checkout_url: checkout.checkoutUrl });

    } catch (error: unknown) {
        console.error("[CREEM_ERROR]", error instanceof Error ? error.message : error);

        return NextResponse.json(
            { message: (error instanceof Error ? error.message : "Unknown error") || "Failed to initiate Creem payment" },
            { status: 500 }
        );
    }
}
