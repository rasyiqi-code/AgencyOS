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

        // Record usage (optional: throttle this to avoid spam?)
        // For now, record every "new" session or click.
        // We can use visitorId to prevent duplicate logging if needed.

        await prisma.referralUsage.create({
            data: {
                affiliateId: affiliate.id,
                source: source || "direct",
                visitorId: visitorId,
                // referredUserId is null until they sign up/login, which we can't easily link here without auth context
            }
        });

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Referral Track Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
