import { core } from "@/lib/midtrans";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { paymentService } from "@/lib/server/payment-service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, paymentType, bank } = body;
        const user = await stackServerApp.getUser();

        // 1. Get Order Data
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { project: true }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // 2. Prepare Charge Parameter
        // Core API requires recreating the parameter payload similar to Snap, but with 'payment_type'
        const uniqueTransactionId = `${orderId}-${Date.now()}`;

        // Construct Customer Details
        // Use authenticated user data or fallback to defaults
        const firstName = user?.displayName?.split(" ")[0] || "Valued";
        const lastName = user?.displayName?.split(" ").slice(1).join(" ") || "Client";
        const email = user?.primaryEmail || "client@example.com";
        const phone = "08123456789"; // Placeholder as Stack doesn't provide phone by default

        const customerDetails = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            billing_address: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                address: "Digital Service",
                city: "Jakarta",
                postal_code: "12345",
                country_code: "IDN"
            },
            shipping_address: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                address: "Digital Service",
                city: "Jakarta",
                postal_code: "12345",
                country_code: "IDN"
            }
        };



        // ...

        // 1.5 Convert USD to IDR
        const { idrAmount } = await paymentService.convertToIDR(order.amount);

        // ...

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parameter: any = {
            payment_type: paymentType,
            transaction_details: {
                order_id: uniqueTransactionId,
                gross_amount: idrAmount, // Always charge in IDR
            },
            customer_details: customerDetails,
            item_details: [
                {
                    id: order.projectId || "PROJECT",
                    price: idrAmount, // Use IDR amount
                    quantity: 1,
                    name: order.project?.title?.substring(0, 50) || "Agency Service",
                    merchant_name: "Crediblemark"
                }
            ]
        };

        // 3. Specific Payment Type Configuration
        switch (paymentType) {
            case 'qris':
            case 'gopay':
                parameter.payment_type = 'qris';
                parameter.qris = { acquirer: 'gopay' };
                break;

            case 'shopeepay':
                // ShopeePay Core API usually uses deep link / qr
                parameter.payment_type = 'shopeepay';
                parameter.shopeepay = { callback_url: "http://localhost:3000/invoices/" + orderId };
                break;

            case 'bank_transfer':
                parameter.payment_type = 'bank_transfer';
                parameter.bank_transfer = { bank: bank }; // bca, bni, bri, cimb
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

            case 'cstore': // Indomaret / Alfamart
                parameter.payment_type = 'cstore';
                parameter.cstore = {
                    store: bank, // 'indomaret' or 'alfamart' passed via 'bank' prop for convenience
                    message: "Payment Order #" + orderId
                };
                break;

            // Add other dedicated types if needed
            default:
                break;
        }

        // 4. Charge
        const chargeResponse = await core.charge(parameter);

        // 5. Update Order with Payment Info
        // We save the latest transactionId used so we can map callbacks later
        await prisma.order.update({
            where: { id: orderId },
            data: {
                transactionId: uniqueTransactionId,
                paymentType: paymentType,

                paymentMetadata: chargeResponse
            } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        });

        return NextResponse.json(chargeResponse);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("[CORE_CHARGE_ERROR]", error);

        // Handle "Order ID already used" error by suggesting a retry with new ID?
        // Or user handles it.
        return NextResponse.json(
            { message: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
