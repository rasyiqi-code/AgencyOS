import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

export const getActiveTestimonials = unstable_cache(
    async (limit = 10) => {
        return await prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
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
