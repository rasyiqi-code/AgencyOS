import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.digitalOrder.findUnique({
            where: { id: orderId },
            select: { status: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ status: order.status });
    } catch (error) {
        console.error("Error fetching order status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
