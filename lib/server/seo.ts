import { prisma } from "@/lib/config/db";
import { cache } from "react";

/**
 * Fetch SEO metadata for a specific path with caching and memoization.
 * React cache() ensures that calling this multiple times in a single render 
 * (e.g. in generateMetadata and then in a Page component) hits the database only once.
 */
export const getPageSeo = cache(async (path: string) => {
    return unstable_cache(
        async (p: string) => {
            try {
                const pageSeo = await prisma.pageSeo.findUnique({
                    where: { path: p }
                });
                return pageSeo;
            } catch (error) {
                console.error(`[SEO] Fetch Error for ${p}:`, error);
                return null;
            }
        },
        [`page-seo-${path}`],
        {
            tags: ["page-seo"],
            revalidate: 3600, // 1 hour
        }
    )(path);
});
