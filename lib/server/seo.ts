import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

/**
 * Fetch SEO metadata for a specific path with caching.
 */
export const getPageSeo = unstable_cache(
    async (path: string) => {
        try {
            const pageSeo = await prisma.pageSeo.findUnique({
                where: { path }
            });
            return pageSeo;
        } catch (error) {
            console.error(`[SEO] Failed to fetch SEO for path ${path}:`, error);
            return null;
        }
    },
    ["page-seo"],
    {
        tags: ["page-seo"],
        revalidate: 3600, // 1 hour
    }
);
