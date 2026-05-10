import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { Service } from "@prisma/client";

const inFlightServicesRequests = new Map<string, Promise<unknown>>();

export const getServices = async (onlyActive = true) => {
    const cacheKey = `services-list-${onlyActive}`;
    if (inFlightServicesRequests.has(cacheKey)) return inFlightServicesRequests.get(cacheKey) as Promise<Service[]>;

    const request = (async () => {
        return unstable_cache(
            async (activeOnly: boolean) => {
                return await prisma.service.findMany({
                    where: activeOnly ? {
                        isActive: true,
                        visibility: 'PUBLIC'
                    } : {},
                    orderBy: { updatedAt: 'desc' }
                });
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
        return await (request as Promise<Service[]>);
    } finally {
        inFlightServicesRequests.delete(cacheKey);
    }
};

export const getServiceBySlug = async (slug: string) => {
    const cacheKey = `service-detail-${slug}`;
    if (inFlightServicesRequests.has(cacheKey)) return inFlightServicesRequests.get(cacheKey) as Promise<Service | null>;

    const request = (async () => {
        return unstable_cache(
            async (s: string) => {
                return await prisma.service.findUnique({
                    where: { slug: s }
                });
            },
            [cacheKey],
            {
                tags: [`service-${slug}`, "services"],
                revalidate: 3600,
            }
        )(slug);
    })();

    inFlightServicesRequests.set(cacheKey, request);
    try {
        return await (request as Promise<Service | null>);
    } finally {
        inFlightServicesRequests.delete(cacheKey);
    }
};
