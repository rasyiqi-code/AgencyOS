import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { creem } from "@/lib/creem";

export async function POST(req: NextRequest) {
    try {

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
        }

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

        let productId = "";

        // 1. CHECK: Has a dynamic product already been created for this Order? (Use Metadata)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta = (order.paymentMetadata as any) || {};

        if (meta.creemProductId) {
            productId = meta.creemProductId;
            console.log("Reusing existing Dynamic Creem Product ID:", productId);
        }
        // 2. CHECK: Use synced Creem Product ID if available (Official Services)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (order.project?.service && (order.project.service as any).creemProductId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            productId = (order.project.service as any).creemProductId;
            console.log("Using synced Official Creem Product ID:", productId);
        }
        else {
            // 3. FALLBACK: Create a NEW dynamic product
            console.log("Creating NEW Dynamic Creem Product for Order:", order.id);
            const product = await creem.products.create({
                name: `Invoice #${order.id.slice(-8).toUpperCase()}`,
                description: `Payment for Order #${order.id}`,
                price: Math.round(order.amount * 100), // Convert to cents
                currency: "USD",
                billingType: "onetime", // CamelCase
                taxMode: "inclusive", // CamelCase
                taxCategory: "digital-goods-service" // CamelCase
            });
            productId = product.id;

            // SAVE IT to Order Metadata so next time we reuse it!
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentMetadata: {
                        ...meta,
                        creemProductId: productId
                    }
                }
            });
            console.log("Saved new Dynamic Product ID to Order Metadata:", productId);
        }

        // 2. Create Checkout Session
        const checkout = await creem.checkouts.create({
            productId: productId, // CamelCase
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/status?orderId=${order.id}`, // CamelCase
            metadata: {
                orderId: order.id
            },

        });

        // 3. Update Order with Payment Type
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentType: "creem_credit_card",
            }
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
