import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const profile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id },
            include: {
                commissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: { referrals: true }
                }
            }
        });

        if (!profile) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json({
            ...profile,
            referralCount: profile._count.referrals
        });

    } catch (error) {
        console.error("Affiliate Stats Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
