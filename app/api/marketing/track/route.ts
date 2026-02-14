import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { code, source, visitorId } = await req.json();

        if (!code) {
            return new NextResponse("Missing code", { status: 400 });
        }

        // Verify affiliate exists
        const affiliate = await prisma.affiliateProfile.findUnique({
            where: { referralCode: code }
        });

        if (!affiliate || affiliate.status !== 'active') {
            // Invalid code, but we don't want to alert the user visibly, just ignore
            return NextResponse.json({ status: "invalid" });
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('agencyos_affiliate_id', code, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
            httpOnly: true, // Secure
            sameSite: 'lax'
        });

        // Deduplication: cek apakah visitorId ini sudah pernah di-track untuk affiliate yang sama
        // Mencegah spam DB dan data referral yang tidak akurat
        if (visitorId) {
            const existing = await prisma.referralUsage.findFirst({
                where: {
                    affiliateId: affiliate.id,
                    visitorId: visitorId,
                }
            });

            // Skip jika visitor sudah pernah di-track
            if (existing) {
                return NextResponse.json({ status: "ok" });
            }
        }

        await prisma.referralUsage.create({
            data: {
                affiliateId: affiliate.id,
                source: source || "direct",
                visitorId: visitorId,
            }
        });

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Referral Track Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
