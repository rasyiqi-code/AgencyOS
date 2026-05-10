import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

const inFlightServicesRequests = new Map<string, Promise<any>>();

export const getServices = async (onlyActive = true) => {
    const cacheKey = `services-list-${onlyActive}`;
    if (inFlightServicesRequests.has(cacheKey)) return inFlightServicesRequests.get(cacheKey)!;

    const request = (async () => {
        return unstable_cache(
            async (activeOnly: boolean) => {
                try {
                    return await prisma.service.findMany({
                        where: activeOnly ? {
                            isActive: true,
                            visibility: 'PUBLIC'
                        } : {},
                        orderBy: { updatedAt: 'desc' }
                    });
                } catch (error) {
                    console.error("[Services] Failed to fetch services:", error);
                    return [];
                }
            },
            [cacheKey],
            {
                tags: ["services"],
                revalidate: 3600,
            }
        )(onlyActive);
    })();

    inFlightServicesRequests.set(cacheKey, request);
    try {
        return await request;
    } finally {
        inFlightServicesRequests.delete(cacheKey);
    }
};
