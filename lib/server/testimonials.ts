import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

export const getActiveTestimonials = unstable_cache(
    async (limit = 10) => {
        try {
            return await prisma.testimonial.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: limit
            });
        } catch (error) {
            console.error("[Testimonials] Failed to fetch active testimonials:", error);
            return [];
        }
    },
    ["active-testimonials"],
    {
        tags: ["testimonials"],
        revalidate: 3600, // Cache for 1 hour
    }
);

export const getAllTestimonials = async () => {
    return await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
    });
};
