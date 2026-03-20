import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

/**
 * GET /api/v1/subscription/check?email=...&productId=...
 * 
 * Verifies if a user has an active subscription/purchase for a specific product.
 * Requires a Bearer token (API Key) for authentication.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const productId = searchParams.get("productId") || 
                          searchParams.get("productSlug") || 
                          searchParams.get("product_slug");
        const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        // 1. Check Database Keys (provider: agency-os)
        const dbKey = await prisma.systemKey.findFirst({
            where: {
                key: apiKey,
                provider: "agency-os",
                isActive: true
            }
        });

        // 2. Fallback to Environment Variable
        const envKey = process.env.AGENCY_OS_API_KEY;
        const isValid = !!dbKey || (envKey && apiKey === envKey);

        if (!isValid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!email || !productId) {
            return NextResponse.json({ error: "Missing email or productId" }, { status: 400 });
        }

        // Check for an active, paid digital order
        const order = await prisma.digitalOrder.findFirst({
            where: {
                userEmail: email,
                status: "PAID",
                OR: [
                    { product: { slug: productId } }, // Match by slug
                    { productId: productId }          // Match by database internal ID (backward compatibility)
                ]
            },
            include: {
                license: true,
                product: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!order) {
            return NextResponse.json({ 
                active: false, 
                message: "No active subscription found for this email and product." 
            });
        }

        // Check license expiration if it's a subscription
        let isExpired = false;
        if (order.license?.expiresAt) {
            isExpired = new Date() > new Date(order.license.expiresAt);
        }

        if (isExpired) {
            return NextResponse.json({ 
                active: false, 
                message: "Subscription has expired.",
                expiredAt: order.license?.expiresAt
            });
        }

        // Auto-activate license for SaaS products on first check if not already activated
        if (order.product.type === "saas" && order.license && order.license.activations === 0) {
            try {
                await prisma.license.update({
                    where: { id: order.license.id },
                    data: {
                        activations: { increment: 1 },
                        metadata: {
                            ...(order.license.metadata as object || {}),
                            activatedVia: "saas_check",
                            activatedAt: new Date().toISOString()
                        }
                    }
                });
                // Update local object for response if needed
                order.license.activations = 1;
            } catch (e) {
                console.error("[AUTO_ACTIVATE_ERROR]", e);
                // Continue despite error
            }
        }

        return NextResponse.json({
            active: true,
            orderId: order.id,
            email: order.userEmail,
            productName: order.product.name,
            purchaseDate: order.createdAt,
            expiresAt: order.license?.expiresAt || null,
            licenseKey: order.license?.key || null,
            // New fields based on suggestion
            price: order.product.price,
            currency: order.product.currency,
            interval: order.product.interval || "one_time",
            metadata: order.metadata || {},
        });

    } catch (error) {
        console.error("[SUBSCRIPTION_CHECK_API_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
