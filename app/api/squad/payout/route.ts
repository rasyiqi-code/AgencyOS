import { hexclaveServerApp } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
        });

        if (!squadProfile) {
            return NextResponse.json({ error: "Squad profile not found" }, { status: 404 });
        }

        const body = await request.json();
        const { amount, method, details } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Buat data PayoutRequest baru yang dikaitkan langsung ke squadId (tanpa profil affiliate dummy)
        const payoutRequest = await prisma.payoutRequest.create({
            data: {
                squadId: squadProfile.id,
                amount: parseFloat(amount),
                bankInfo: details || {},
                notes: `Squad payout request via ${method}`,
            }
        });

        return NextResponse.json({ success: true, payoutRequest });
    } catch (error) {
        console.error("Squad payout error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
