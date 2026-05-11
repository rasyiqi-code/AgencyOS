import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * Fetch all services with caching and memoization.
 */
export const getServices = cache(async (onlyActive = true) => {
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
        [`services-list-${onlyActive}`],
        {
            tags: ["services"],
            revalidate: 3600,
        }
    )(onlyActive);
});

/**
 * Fetch a single service by slug with caching and memoization.
 */
export const getServiceBySlug = cache(async (slug: string) => {
    return unstable_cache(
        async (s: string) => {
            return await prisma.service.findUnique({
                where: { slug: s }
            });
        },
        [`service-detail-${slug}`],
        {
            tags: [`service-${slug}`, "services"],
            revalidate: 3600,
        }
    )(slug);
});
