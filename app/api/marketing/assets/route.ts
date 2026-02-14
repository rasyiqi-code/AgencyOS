
import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Check if user is affiliate (optional, but good practice)
        // For now, allow any logged in user (potential affiliate)

        const assets = await prisma.marketingAsset.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Affiliate Marketing Assets Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
