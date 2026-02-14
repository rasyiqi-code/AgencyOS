import { getSnap } from "@/lib/integrations/midtrans";
import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";
import { paymentService } from "@/lib/server/payment-service";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { validateCoupon, applyCoupon } from "@/lib/server/marketing";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, estimateId, title, paymentType = "FULL", appliedCoupon, currency = "USD" } = await req.json();

        if (!projectId && !estimateId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let dbAmount = 0;
        let finalProjectId = projectId;
        let projectTotalAmount = 0;

        // If no projectId but we have estimateId, find or create the project
        if (!finalProjectId && estimateId) {
            const estimate = await prisma.estimate.findUnique({
                where: { id: estimateId },
                include: { project: true, service: true }
            });

            if (!estimate) {
                return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
            }

            dbAmount = estimate.totalCost;

            // Check currency for estimate
            if (estimate.service?.currency === 'IDR') {
                const { rate } = await paymentService.convertToIDR(1);
                dbAmount = dbAmount / rate;
            }

            projectTotalAmount = dbAmount;

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
                        totalAmount: projectTotalAmount,
                    }
                });
                finalProjectId = newProject.id;
            }
        } else if (finalProjectId) {
            // Existing project - find the price from estimate or service
            const project = await prisma.project.findUnique({
                where: { id: finalProjectId },
                include: { estimate: { include: { service: true } }, service: true }
            });

            if (!project) {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }

            if (project.estimate) {
                dbAmount = project.estimate.totalCost;
                // Estimates are usually in USD by default, but check service if linked
                if (project.estimate.service?.currency === 'IDR') {
                    const { rate } = await paymentService.convertToIDR(1);
                    dbAmount = dbAmount / rate;
                }
            } else if (project.service) {
                dbAmount = project.service.price;
                if (project.service.currency === 'IDR') {
                    const { rate } = await paymentService.convertToIDR(1);
                    dbAmount = dbAmount / rate;
                }
            } else {
                return NextResponse.json({ error: "No pricing source found for this project" }, { status: 400 });
            }
            projectTotalAmount = dbAmount;

            // Update totalAmount if it's 0 (migration for existing projects)
            if (project.totalAmount === 0 && dbAmount > 0) {
                await prisma.project.update({
                    where: { id: finalProjectId },
                    data: { totalAmount: dbAmount }
                });
            }
        }

        if (dbAmount <= 0) {
            return NextResponse.json({ error: "Invalid payment amount calculation" }, { status: 400 });
        }

        // Calculate amount based on payment type
        let amountToPay = dbAmount;
        let itemName = title ? title.substring(0, 50) : "Project Payment";

        if (paymentType === "DP") {
            amountToPay = dbAmount * 0.5; // 50% DP
            itemName = `DP: ${itemName}`;
        } else if (paymentType === "REPAYMENT") {
            const project = await prisma.project.findUnique({ where: { id: finalProjectId } });
            const paid = project?.paidAmount || 0;
            const total = project?.totalAmount || dbAmount;
            amountToPay = total - paid;
            itemName = `Repayment: ${itemName}`;

            if (amountToPay <= 0) {
                return NextResponse.json({ message: "Project already fully paid" }, { status: 400 });
            }
        }

        // Ensure itemName fits Midtrans limit (50 chars)
        itemName = itemName.substring(0, 50);

        // Validasi dan terapkan kupon server-side (jika ada)
        let validatedCoupon: { code: string; discountType: string; discountValue: number } | null = null;
        if (appliedCoupon && typeof appliedCoupon === 'string') {
            const couponResult = await validateCoupon(appliedCoupon);
            if (couponResult.valid && couponResult.coupon) {
                validatedCoupon = couponResult.coupon;
                // Hitung diskon
                if (validatedCoupon.discountType === 'percentage') {
                    amountToPay = amountToPay * (1 - validatedCoupon.discountValue / 100);
                } else {
                    // Fixed amount discount
                    amountToPay = Math.max(0, amountToPay - validatedCoupon.discountValue);
                }
                amountToPay = Math.round(amountToPay * 100) / 100; // Round to 2 decimal
                console.log(`[CHECKOUT] Coupon ${validatedCoupon.code} applied: ${validatedCoupon.discountType} ${validatedCoupon.discountValue} → final $${amountToPay}`);
            } else {
                // Kupon tidak valid — lanjutkan tanpa diskon, log warning
                console.warn(`[CHECKOUT] Invalid coupon code: ${appliedCoupon}`);
            }
        }

        if (amountToPay <= 0) {
            return NextResponse.json({ error: "Invalid payment amount after discount" }, { status: 400 });
        }

        // Convert to IDR and ensure integer for Midtrans
        // Determine Rate and IDR Amount based on requested currency
        let finalRate = 1;
        let finalIdrAmount = 0;

        // Fetch current rate
        const { idrAmount: calculatedIdrAmount, rate } = await paymentService.convertToIDR(amountToPay);

        // Lock the rate and calculate IDR amount regardless of selected currency
        // This ensures consistent rate display and logging
        finalRate = rate;
        finalIdrAmount = Math.ceil(calculatedIdrAmount);

        console.log(`[CHECKOUT] Type: ${paymentType}, Currency: ${currency}, Amount: ${amountToPay} USD -> ${finalIdrAmount} IDR (Rate: ${finalRate})`);

        // Detect gateway availability
        const hasGateway = await paymentGatewayService.hasActiveGateway();

        // Check for existing pending order for this project AND this payment type
        const existingOrder = await prisma.order.findFirst({
            where: {
                projectId: finalProjectId,
                type: paymentType,
                status: 'pending'
            }
        });

        // Reuse existing order logic
        if (existingOrder && existingOrder.amount === amountToPay) {
            const orderId = existingOrder.id;
            let snapToken = existingOrder.snapToken;

            if (hasGateway && !snapToken) {
                const parameter = {
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: finalIdrAmount,
                    },
                    credit_card: { secure: true },
                    customer_details: {
                        first_name: user.displayName || user.primaryEmail || "Customer",
                        email: user.primaryEmail,
                    },
                    item_details: [{
                        id: finalProjectId,
                        price: finalIdrAmount,
                        quantity: 1,
                        name: itemName,
                    }]
                };

                const snap = await getSnap();
                const transaction = await snap.createTransaction(parameter);
                snapToken = transaction.token;

                await prisma.order.update({
                    where: { id: orderId },
                    data: { snapToken }
                });
            }

            // Sync invoiceId to project for easier dashboard access (optional, maybe specific for latest order)
            await prisma.project.update({
                where: { id: finalProjectId },
                data: { invoiceId: orderId }
            });

            return NextResponse.json({ token: snapToken, orderId });
        } else if (existingOrder) {
            // Amount changed, delete old pending order
            await prisma.order.delete({ where: { id: existingOrder.id } });
        }

        // Create a unique order ID
        const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        let snapToken = null;

        if (hasGateway) {
            // Prepare Midtrans transaction details
            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: finalIdrAmount, // Use IDR
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
                        price: finalIdrAmount, // Use IDR
                        quantity: 1,
                        name: itemName,
                    },
                ],
            };

            // Get Snap Token from Midtrans
            const snap = await getSnap();
            const transaction = await snap.createTransaction(parameter);
            snapToken = transaction.token;
        }

        // Check for affiliate cookie
        const cookieStore = await cookies();
        const affiliateCode = cookieStore.get('agencyos_affiliate_id')?.value;

        // Save order to database
        await prisma.order.create({
            data: {
                id: orderId,
                amount: amountToPay,
                userId: user.id,
                project: finalProjectId ? { connect: { id: finalProjectId } } : undefined,
                snapToken,
                status: "pending",
                type: paymentType, // Save type
                currency: currency,
                exchangeRate: finalRate,
                paymentMetadata: {
                    ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
                    ...(validatedCoupon ? { coupon_code: validatedCoupon.code, coupon_discount: validatedCoupon.discountValue, coupon_type: validatedCoupon.discountType } : {}),
                } as unknown as Prisma.InputJsonValue,
            },
        });

        // Increment usedCount kupon jika valid
        if (validatedCoupon) {
            await applyCoupon(validatedCoupon.code);
        }

        // Sync invoiceId to project and RESET estimate if REPAYMENT
        const updateData = {
            invoiceId: orderId,
            totalAmount: projectTotalAmount // Ensure total amount is set
        };

        if (paymentType === 'REPAYMENT' && estimateId) {
            // Reset estimate to pending to show up in Admin Finance as "Awaiting Confirmation"
            await prisma.estimate.update({
                where: { id: estimateId },
                data: {
                    status: 'pending_payment',
                    // Optional: we can track the current payment type in the estimate too if needed
                }
            });
        }

        await prisma.project.update({
            where: { id: finalProjectId },
            data: updateData
        });

        return NextResponse.json({ token: snapToken, orderId });
    } catch (error) {
        console.error("[MIDTRANS_CHECKOUT_ERROR]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

