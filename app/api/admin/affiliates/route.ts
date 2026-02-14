import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Admin check: cek ADMIN_EMAILS dan SUPER_ADMIN_ID
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const affiliates = await prisma.affiliateProfile.findMany({
            include: {
                _count: { select: { referrals: true, commissions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate aggregates
        const totalPaid = affiliates.reduce((acc, curr) => acc + (curr.paidEarnings || 0), 0);
        const totalEarnings = affiliates.reduce((acc, curr) => acc + (curr.totalEarnings || 0), 0);
        const pendingPayouts = totalEarnings - totalPaid;

        // Get default commission rate & Resend API Key
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ["affiliate_default_commission_rate", "RESEND_API_KEY"] }
            }
        });

        const defaultRate = parseFloat(settings.find(s => s.key === "affiliate_default_commission_rate")?.value || "10");
        const resendKeyRaw = settings.find(s => s.key === "RESEND_API_KEY")?.value;
        const resendApiKey = resendKeyRaw ? `${resendKeyRaw.substring(0, 4)}...${resendKeyRaw.substring(resendKeyRaw.length - 4)}` : "";

        return NextResponse.json({
            affiliates,
            stats: {
                totalAffiliates: affiliates.length,
                totalPaid,
                pendingPayouts,
                totalEarnings
            },
            defaultRate,
            resendApiKey
        });

    } catch (error) {
        console.error("Admin Affiliates Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
