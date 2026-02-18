import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";
import { notifyNewAffiliate } from "@/lib/email/admin-notifications";

export async function POST() {
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

        // Ensure uniqueness (dengan batas retry untuk mencegah infinite loop)
        const MAX_RETRIES = 10;
        let isUnique = false;
        let retries = 0;
        while (!isUnique) {
            if (retries >= MAX_RETRIES) {
                return NextResponse.json(
                    { error: "Failed to generate unique referral code. Please try again." },
                    { status: 500 }
                );
            }
            const check = await prisma.affiliateProfile.findUnique({ where: { referralCode } });
            if (!check) {
                isUnique = true;
            } else {
                referralCode = `${namePart}${Math.floor(Math.random() * 100000)}`;
                retries++;
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

        // Notify Admin
        notifyNewAffiliate({
            name: profile.name,
            email: profile.email,
            code: profile.referralCode
        }).catch(err => console.error("Failed to send admin notification:", err));

        return NextResponse.json(profile);

    } catch (error) {
        console.error("Affiliate Register Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
