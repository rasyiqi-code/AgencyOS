import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { redirect } from "next/navigation";
import { PayoutsClient } from "@/components/marketing/payouts-client";

/**
 * Server component halaman Payouts.
 * Mengambil data affiliate profile lalu render PayoutsClient.
 */
export default async function AffiliatePayoutsPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    const profile = await prisma.affiliateProfile.findUnique({
        where: { userId: user.id }
    });

    if (!profile) {
        redirect('/affiliate/join');
    }

    const availableBalance = profile.totalEarnings - profile.paidEarnings;

    return (
        <PayoutsClient
            initialBalance={availableBalance}
            affiliateName={profile.name}
            totalEarnings={profile.totalEarnings}
            paidEarnings={profile.paidEarnings}
        />
    );
}
