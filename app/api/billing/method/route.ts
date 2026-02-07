
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, paymentType, metadata } = body;

        if (!orderId) return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentType,
                paymentMetadata: metadata
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Select Payment Method Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
