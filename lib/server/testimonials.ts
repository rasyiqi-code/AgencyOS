import { prisma } from "@/lib/config/db";
import { cache } from "react";
import { safeUnstableCache as unstable_cache } from "@/lib/shared/cache";

/**
 * Fetch active testimonials with caching and memoization.
 */
export const getActiveTestimonials = cache(async (limit = 10) => {
    return unstable_cache(
        async () => {
            try {
                return await prisma.testimonial.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: limit
                });
            } catch (error) {
                console.error("[Testimonials] DB Fetch Error:", error);
                return [];
            }
        },
        ["active-testimonials-singleton"],
        {
            tags: ["testimonials"],
            revalidate: 3600, // Cache for 1 hour
        }
    )();
});

export const getAllTestimonials = async (limit?: number) => {
    // Membatasi pengambilan seluruh data testimoni untuk mencegah konsumsi memori berlebih
    return await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit || 100,
    });
};
