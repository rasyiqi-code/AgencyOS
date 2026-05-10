import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { PageSeo } from "@prisma/client";

const inFlightSeoRequests = new Map<string, Promise<unknown>>();

/**
 * Fetch SEO metadata for a specific path with caching.
 */
export const getPageSeo = async (path: string) => {
    if (inFlightSeoRequests.has(path)) {
        return inFlightSeoRequests.get(path) as Promise<PageSeo | null>;
    }

    const request = (async () => {
        return unstable_cache(
            async (p: string) => {
                const pageSeo = await prisma.pageSeo.findUnique({
                    where: { path: p }
                });
                return pageSeo;
            },
            [`page-seo-${path}`],
            {
                tags: ["page-seo"],
                revalidate: 3600, // 1 hour
            }
        )(path);
    })();

    inFlightSeoRequests.set(path, request);

    try {
        return await (request as Promise<PageSeo | null>);
    } finally {
        inFlightSeoRequests.delete(path);
    }
};
