import { getCore } from "@/lib/integrations/midtrans";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { paymentService } from "@/lib/server/payment-service";
import { stackServerApp } from "@/lib/config/stack";
import type { MidtransChargeParameter } from "@/types/payment";

/**
 * Core API Charge Handler khusus untuk Digital Product
 * POST /api/digital-payment/charge
 */
export async function POST(req: Request) {
    try {
        // Auth check: hanya user login yang boleh initiate charge
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, paymentType, bank } = body;

        // 1. Get Order Data
        const order = await prisma.digitalOrder.findUnique({
            where: { id: orderId },
            include: { product: true }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        if (order.status === 'PAID' || order.status === 'settled') {
            return new NextResponse("Order already paid", { status: 400 });
        }

        // 2. Prepare Charge Parameter
        // Core API harus menggunakan transaction_details.order_id yang unik jika sebelumnya gagal/pending
        // Tapi untuk VA statis, biasanya kita ingin keep order_id yang sama.
        // Midtrans best practice: jika retry, gunakan order_id baru (e.g. DIGI-123-retry1) ATAU pastikan transaksi sebelumnya sudah expire/cancel.
        // Simplifikasi: Kita append timestamp jika paymentType berubah atau retry.
        const uniqueTransactionId = `${orderId}-${Date.now()}`;

        // Customer Details
        const customerDetails = {
            first_name: order.userName || order.userEmail.split('@')[0],
            email: order.userEmail,
            phone: "08123456789", // Placeholder
        };

        // Convert USD to IDR
        const { idrAmount } = await paymentService.convertToIDR(order.amount);

        const parameter: MidtransChargeParameter = {
            payment_type: paymentType,
            transaction_details: {
                order_id: uniqueTransactionId,
                gross_amount: idrAmount,
            },
            customer_details: customerDetails,
            item_details: [
                {
                    id: order.productId,
                    price: idrAmount,
                    quantity: 1,
                    name: order.product.name.substring(0, 50),
                    merchant_name: "AgencyOS Digital"
                }
            ]
        };

        // 3. Payment Type Specific Config
        switch (paymentType) {
            case 'qris':
            case 'gopay':
                parameter.payment_type = 'qris';
                parameter.qris = { acquirer: 'gopay' };
                break;

            case 'shopeepay':
                parameter.payment_type = 'shopeepay';
                parameter.shopeepay = { callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/digital-invoices/${orderId}` };
                break;

            case 'bank_transfer':
                parameter.payment_type = 'bank_transfer';
                parameter.bank_transfer = { bank: bank }; // bca, bni, bri, cimb, permata
                break;

            case 'permata':
                parameter.payment_type = 'permata';
                break;

            case 'echannel': // Mandiri Bill
                parameter.payment_type = 'echannel';
                parameter.echannel = {
                    bill_info1: "Payment for:",
                    bill_info2: "Order #" + orderId.slice(-8)
                };
                break;

            case 'cstore':
                parameter.payment_type = 'cstore';
                parameter.cstore = {
                    store: bank, // indomaret / alfamart
                    message: "Order #" + orderId
                };
                break;
        }

        // 4. Charge via Core API
        const core = await getCore();
        const chargeResponse = await core.charge(parameter);

        // 5. Update DigitalOrder
        await prisma.digitalOrder.update({
            where: { id: orderId },
            data: {
                paymentId: uniqueTransactionId,
                paymentType: paymentType,
                paymentMetadata: chargeResponse
            }
        });

        return NextResponse.json(chargeResponse);

    } catch (error: unknown) {
        console.error("[DIGITAL_CORE_CHARGE_ERROR]", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { message },
            { status: 500 }
        );
    }
}
