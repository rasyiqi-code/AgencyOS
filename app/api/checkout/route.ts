import { getSnap } from "@/lib/midtrans";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { NextResponse } from "next/server";
import { paymentService } from "@/lib/server/payment-service";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { projectId, estimateId, amount, title } = await req.json();

        if ((!projectId && !estimateId) || !amount) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let finalProjectId = projectId;

        // If no projectId but we have estimateId, find or create the project
        if (!finalProjectId && estimateId) {
            const estimate = await prisma.estimate.findUnique({
                where: { id: estimateId },
                include: { project: true }
            });

            if (!estimate) {
                return new NextResponse("Estimate not found", { status: 404 });
            }

            if (estimate.project) {
                finalProjectId = estimate.project.id;
            } else {
                // Create new project from estimate
                const newProject = await prisma.project.create({
                    data: {
                        userId: user.id,
                        clientName: user.displayName || user.primaryEmail || "Unnamed Client",
                        title: estimate.title,
                        description: estimate.summary,
                        spec: JSON.stringify({ screens: estimate.screens, apis: estimate.apis }, null, 2),
                        status: "pending_payment",
                        estimateId: estimateId,
                    }
                });
                finalProjectId = newProject.id;
            }
        }

        // Convert to IDR
        const { idrAmount, rate } = await paymentService.convertToIDR(amount);
        console.log(`[CHECKOUT] Converting ${amount} USD to ${idrAmount} IDR (Rate: ${rate})`);

        // Detect gateway availability
        const hasGateway = await paymentGatewayService.hasActiveGateway();

        // Check for existing pending order for this project
        const existingOrder = await prisma.order.findUnique({
            where: { projectId: finalProjectId }
        });

        if (existingOrder && existingOrder.status === 'pending') {
            // Reuse existing order, potentially update Snap Token if needed
            // For simplicity, we create a new transaction to ensure freshness, updating the existing order
            // OR just return existing if valid. Midtrans tokens usually last 24h.
            // Let's UPDATE the existing order with a new ID/Token to be safe + avoid constraint issues if we wanted to recreate.
            // BUT, if projectId is unique in Order table, we MUST update the row, not create new.

            const orderId = existingOrder.id; // Reuse the DB ID
            // Midtrans doesn't allow reusing Order ID for different amount, but same amount is fine?
            // Safest is to generate NEW transaction for the SAME Order Record.

            let snapToken = existingOrder.snapToken;

            if (hasGateway) {
                const parameter = {
                    transaction_details: {
                        order_id: orderId, // Reuse the DB ID
                        gross_amount: idrAmount, // Use IDR
                    },
                    credit_card: { secure: true },
                    customer_details: {
                        first_name: user.displayName || user.primaryEmail || "Customer",
                        email: user.primaryEmail,
                    },
                    item_details: [{
                        id: finalProjectId,
                        price: idrAmount, // Use IDR
                        quantity: 1,
                        name: title ? title.substring(0, 50) : "Project Deposit",
                    }]
                };

                const snap = await getSnap();
                const transaction = await snap.createTransaction(parameter);
                snapToken = transaction.token;
            }

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    snapToken,
                    amount: amount
                }
            });

            await prisma.project.update({
                where: { id: finalProjectId },
                data: { invoiceId: orderId }
            });

            return NextResponse.json({ token: snapToken, orderId });
        } else if (existingOrder && (existingOrder.status === 'paid' || existingOrder.status === 'settled')) {
            return NextResponse.json({
                token: existingOrder.snapToken,
                orderId: existingOrder.id,
                message: "Order already paid"
            });
        }

        // Create a unique order ID
        const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        let snapToken = null;

        if (hasGateway) {
            // Prepare Midtrans transaction details
            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: idrAmount, // Use IDR
                },
                credit_card: {
                    secure: true,
                },
                customer_details: {
                    first_name: user.displayName || user.primaryEmail || "Customer",
                    email: user.primaryEmail,
                },
                item_details: [
                    {
                        id: finalProjectId,
                        price: idrAmount, // Use IDR
                        quantity: 1,
                        name: title ? title.substring(0, 50) : "Project Deposit", // Midtrans name limit
                    },
                ],
            };

            // Get Snap Token from Midtrans
            const snap = await getSnap();
            const transaction = await snap.createTransaction(parameter);
            snapToken = transaction.token;
        }

        // Save order to database
        await prisma.order.create({
            data: {
                id: orderId,
                amount,
                userId: user.id,
                projectId: finalProjectId,
                snapToken,
                status: "pending",
            },
        });

        // Sync invoiceId to project for easier dashboard access
        await prisma.project.update({
            where: { id: finalProjectId },
            data: { invoiceId: orderId }
        });

        return NextResponse.json({ token: snapToken, orderId });
    } catch (error) {
        console.error("[MIDTRANS_CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

