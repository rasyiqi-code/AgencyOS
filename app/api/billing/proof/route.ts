
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const estimateId = formData.get("estimateId") as string;
        const orderId = formData.get("orderId") as string;

        if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
        if (!estimateId && !orderId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const { uploadFile } = await import("@/lib/storage");

        // Handle Estimate Proof
        if (estimateId) {
            const path = `proofs/${estimateId}-${Date.now()}-${file.name}`;
            const url = await uploadFile(file, path);

            await prisma.estimate.update({
                where: { id: estimateId },
                data: { proofUrl: url }
            });

            return NextResponse.json({ success: true, url });
        }

        // Handle Order Proof
        if (orderId) {
            const path = `proofs/orders/${orderId}-${Date.now()}-${file.name}`;
            const url = await uploadFile(file, path);

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    proofUrl: url,
                    status: 'waiting_verification'
                }
            });

            return NextResponse.json({ success: true, url });
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    } catch (error) {
        console.error("Upload Proof Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
