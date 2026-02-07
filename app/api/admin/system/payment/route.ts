import { NextRequest, NextResponse } from "next/server";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { resetMidtransInstances } from "@/lib/integrations/midtrans";
import { resetCreemInstance } from "@/lib/integrations/creem";
import { isAdmin } from "@/lib/shared/auth-helpers";

/**
 * GET /api/admin/system/payment
 * Fetch current payment gateway configurations
 */
export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const [midtrans, creem] = await Promise.all([
            paymentGatewayService.getMidtransConfig(),
            paymentGatewayService.getCreemConfig()
        ]);

        // Don't expose full keys in response - show only last 4 chars
        const safeMidtrans = {
            ...midtrans,
            serverKey: midtrans.serverKey ? `***${midtrans.serverKey.slice(-4)}` : '',
            clientKey: midtrans.clientKey ? `***${midtrans.clientKey.slice(-4)}` : '',
        };

        const safeCreem = {
            ...creem,
            apiKey: creem.apiKey ? `***${creem.apiKey.slice(-4)}` : '',
        };

        return NextResponse.json({
            midtrans: safeMidtrans,
            creem: safeCreem
        });
    } catch (error) {
        console.error("[PaymentGatewayAPI] GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment gateway config" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/system/payment
 * Save payment gateway configuration
 */
export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { gateway, config } = await req.json();

        if (!gateway || !config) {
            return NextResponse.json(
                { error: "Missing gateway or config" },
                { status: 400 }
            );
        }

        if (gateway === "midtrans") {
            // Validate required fields
            if (!config.serverKey || !config.clientKey || !config.merchantId) {
                return NextResponse.json(
                    { error: "Missing required Midtrans fields" },
                    { status: 400 }
                );
            }

            await paymentGatewayService.saveMidtransConfig({
                serverKey: config.serverKey,
                clientKey: config.clientKey,
                merchantId: config.merchantId,
                isProduction: config.isProduction || false
            });

            // Reset instances to force reload with new config
            resetMidtransInstances();

            return NextResponse.json({
                success: true,
                message: "Midtrans configuration saved successfully"
            });
        }

        else if (gateway === "creem") {
            // Validate required fields
            if (!config.apiKey || !config.storeId) {
                return NextResponse.json(
                    { error: "Missing required Creem fields" },
                    { status: 400 }
                );
            }

            await paymentGatewayService.saveCreemConfig({
                apiKey: config.apiKey,
                storeId: config.storeId,
                isProduction: config.isProduction || false
            });

            // Reset instance to force reload with new config
            resetCreemInstance();

            return NextResponse.json({
                success: true,
                message: "Creem configuration saved successfully"
            });
        }

        else {
            return NextResponse.json(
                { error: "Invalid gateway. Must be 'midtrans' or 'creem'" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("[PaymentGatewayAPI] POST error:", error);
        return NextResponse.json(
            { error: "Failed to save payment gateway config" },
            { status: 500 }
        );
    }
}
