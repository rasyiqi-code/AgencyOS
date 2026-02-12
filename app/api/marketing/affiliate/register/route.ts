import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if already affiliate
        const existingProfile = await prisma.affiliateProfile.findUnique({
            where: { userId: user.id }
        });

        if (existingProfile) {
            return NextResponse.json({ message: "Already registered", profile: existingProfile });
        }

        // Generate Referral Code
        // Simple strategy: First name + random number
        const namePart = (user.displayName || "user").split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        let referralCode = `${namePart}${Math.floor(Math.random() * 1000)}`;

        // Ensure uniqueness
        let isUnique = false;
        while (!isUnique) {
            const check = await prisma.affiliateProfile.findUnique({ where: { referralCode } });
            if (!check) {
                isUnique = true;
            } else {
                referralCode = `${namePart}${Math.floor(Math.random() * 10000)}`;
            }
        }

        // Get default commission rate
        const defaultRateSetting = await prisma.systemSetting.findUnique({
            where: { key: "affiliate_default_commission_rate" }
        });
        const defaultRate = defaultRateSetting ? parseFloat(defaultRateSetting.value) : 10;

        // Create Profile
        const profile = await prisma.affiliateProfile.create({
            data: {
                userId: user.id,
                name: user.displayName || user.primaryEmail || "Affiliate",
                email: user.primaryEmail || "",
                referralCode: referralCode,
                status: "active", // Auto-approve for now
                commissionRate: defaultRate,
            }
        });

        return NextResponse.json(profile);

    } catch (error) {
        console.error("Affiliate Register Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
