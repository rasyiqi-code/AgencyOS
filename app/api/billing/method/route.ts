
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya user login yang boleh mengubah metode pembayaran
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, paymentType, metadata } = body;

        if (!orderId) return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

        // Fetch existing order dan verifikasi ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentMetadata: true, project: { select: { userId: true } } }
        });

        if (order) {
            // Pastikan order milik user yang login
            if (order.project?.userId !== user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const currentMeta = order?.paymentMetadata as object || {};

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentType,
                    paymentMetadata: {
                        ...currentMeta,
                        ...metadata
                    } as unknown as Prisma.InputJsonValue
                }
            });

            return NextResponse.json({ success: true });
        }

        // Try DigitalOrder
        const digitalOrder = await prisma.digitalOrder.findUnique({
            where: { id: orderId }
        });

        if (digitalOrder) {
            if (digitalOrder.userId !== user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const currentMeta = digitalOrder.paymentMetadata as object || {};

            await prisma.digitalOrder.update({
                where: { id: orderId },
                data: {
                    paymentType,
                    paymentMetadata: {
                        ...currentMeta,
                        ...metadata
                    } as unknown as Prisma.InputJsonValue
                }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    } catch (error) {
        console.error("Select Payment Method Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
