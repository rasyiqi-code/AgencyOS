import { prisma } from "@/lib/config/db";

/**
 * Fetch affiliate name by referral code dengan caching bawaan Next.js.
 * OPTIMASI M6: Menghapus Map inFlightAffiliateRequests untuk mencegah risiko kebocoran memori (memory leak) dan membersihkan eslint-disable.
 */
export const getAffiliateName = (referralCode: string) => {
    return unstable_cache(
        async (code: string) => {
            const affiliate = await prisma.affiliateProfile.findUnique({
                where: { referralCode: code },
                select: { name: true }
            });
            return affiliate?.name || null;
        },
        [`affiliate-name-${referralCode}`],
        {
            tags: [`affiliate-${referralCode}`],
            revalidate: 3600, // 1 jam
        }
    )(referralCode);
};
