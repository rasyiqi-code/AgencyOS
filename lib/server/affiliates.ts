import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightAffiliateRequests = new Map<string, Promise<any>>();

/**
 * Fetch affiliate name by referral code with caching and deduplication.
 */
export const getAffiliateName = async (referralCode: string) => {
    if (inFlightAffiliateRequests.has(referralCode)) {
        return inFlightAffiliateRequests.get(referralCode) as Promise<string | null>;
    }

    const request = (async () => {
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
                revalidate: 3600, // 1 hour
            }
        )(referralCode);
    })();

    inFlightAffiliateRequests.set(referralCode, request);

    try {
        return await (request as Promise<string | null>);
    } finally {
        inFlightAffiliateRequests.delete(referralCode);
    }
};
