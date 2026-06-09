import { hexclaveServerApp } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/server/settings";

export async function GET(request: Request) {
    try {
        const user = await hexclaveServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Cek Admin: cek ADMIN_EMAILS dan SUPER_ADMIN_ID
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Ambil parameter pagination dari query string
        const url = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1), 100);
        const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
        const skip = (page - 1) * limit;

        // Hitung agregat secara global langsung di database untuk performa tinggi
        const aggregates = await prisma.affiliateProfile.aggregate({
            _sum: {
                paidEarnings: true,
                totalEarnings: true,
            },
            _count: {
                id: true,
            }
        });

        const totalPaid = aggregates._sum.paidEarnings || 0;
        const totalEarnings = aggregates._sum.totalEarnings || 0;
        const pendingPayouts = totalEarnings - totalPaid;
        const totalAffiliates = aggregates._count.id || 0;

        // Ambil data afiliasi dengan batasan take dan skip
        const affiliates = await prisma.affiliateProfile.findMany({
            include: {
                _count: { select: { referrals: true, commissions: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
        });

        // Get default commission rate & Resend API Key
        // ⚡ Bolt Optimization: Use getSystemSettings (which utilizes unstable_cache) instead of direct prisma query.
        // 🎯 Why: Reduces database load by caching frequently accessed affiliate settings.
        // 📊 Impact: Eliminates a database query on the affiliates endpoint.
        const settings = await getSystemSettings(["affiliate_default_commission_rate", "RESEND_API_KEY"]);

        const defaultRate = parseFloat(settings.find((s: { key: string; value: string }) => s.key === "affiliate_default_commission_rate")?.value || "10");
        const resendKeyRaw = settings.find((s: { key: string; value: string }) => s.key === "RESEND_API_KEY")?.value;
        const resendApiKey = resendKeyRaw ? `${resendKeyRaw.substring(0, 4)}...${resendKeyRaw.substring(resendKeyRaw.length - 4)}` : "";

        return NextResponse.json({
            affiliates,
            stats: {
                totalAffiliates,
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
