import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

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

export const getAllTestimonials = async () => {
    return await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
    });
};
