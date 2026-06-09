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

        // Karena tidak ada tabel SquadPayoutRequest terpisah, kita cek apakah ada AffiliateProfile untuk user ini.
        // Jika belum ada, kita buatkan profil affiliate dummy agar data payout request bisa tersimpan di tabel PayoutRequest
        let affiliateProfile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
        });

        if (!affiliateProfile) {
            affiliateProfile = await prisma.affiliateProfile.create({
                data: {
                    userId: user.id,
                    name: squadProfile.name,
                    email: squadProfile.email,
                    referralCode: `squad-${squadProfile.id.slice(-6)}`,
                    status: "approved",
                    bankInfo: details || {},
                }
            });
        }

        // Buat data PayoutRequest baru
        const payoutRequest = await prisma.payoutRequest.create({
            data: {
                affiliateId: affiliateProfile.id,
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
