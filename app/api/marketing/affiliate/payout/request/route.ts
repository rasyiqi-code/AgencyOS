import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * POST /api/marketing/affiliate/payout/request
 * Affiliate submit permintaan pencairan dana.
 * Validasi: min $50, saldo cukup, tidak ada request pending.
 */
export async function POST() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const profile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            return NextResponse.json({ error: "Affiliate profile not found" }, { status: 404 });
        }

        const availableBalance = profile.totalEarnings - profile.paidEarnings;
        const MIN_PAYOUT = 50;

        if (availableBalance < MIN_PAYOUT) {
            return NextResponse.json({
                error: `Minimum payout is $${MIN_PAYOUT}. Your available balance is $${availableBalance.toFixed(2)}.`
            }, { status: 400 });
        }

        // Cek apakah ada request pending yang belum diproses
        const existingPending = await prisma.payoutRequest.findFirst({
            where: { affiliateId: profile.id, status: "pending" }
        });

        if (existingPending) {
            return NextResponse.json({
                error: "You already have a pending payout request. Please wait for it to be processed."
            }, { status: 400 });
        }

        // Buat payout request dengan snapshot bank info
        const payoutRequest = await prisma.payoutRequest.create({
            data: {
                affiliateId: profile.id,
                amount: availableBalance,
                bankInfo: profile.bankInfo ?? Prisma.JsonNull,
            }
        });

        return NextResponse.json({ success: true, payoutRequest });
    } catch (error) {
        console.error("Payout Request Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * GET /api/marketing/affiliate/payout/request
 * Ambil daftar payout request milik affiliate yang login.
 */
export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const profile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const requests = await prisma.payoutRequest.findMany({
            where: { affiliateId: profile.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ requests, balance: profile.totalEarnings - profile.paidEarnings });
    } catch (error) {
        console.error("Payout List Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
