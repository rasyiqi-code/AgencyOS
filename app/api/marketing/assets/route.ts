
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET() {
    try {
        const user = await hexclaveServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Check if user is admin
        const userIsAdmin = await isAdmin();

        // Check if user is affiliate (status: approved)
        const affiliate = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
        });
        const isAffiliate = affiliate && affiliate.status === "approved";

        if (!userIsAdmin && !isAffiliate) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const assets = await prisma.marketingAsset.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Affiliate Marketing Assets Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
