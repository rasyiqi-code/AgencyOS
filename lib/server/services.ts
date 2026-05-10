import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";

export const getServices = unstable_cache(
    async (onlyActive = true) => {
        try {
            return await prisma.service.findMany({
                where: onlyActive ? {
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
    ["services-list"],
    {
        tags: ["services"],
        revalidate: 3600,
    }
);
