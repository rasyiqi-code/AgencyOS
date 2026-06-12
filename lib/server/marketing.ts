import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";





// --- Subscribers ---

export async function createSubscriber(email: string, name?: string) {
    // Check if exists
    const existing = await prisma.marketingSubscriber.findUnique({
        where: { email },
    });

    if (existing) return { success: true, message: "Already subscribed" };

    const subscriber = await prisma.marketingSubscriber.create({
        data: {
            email,
            name,
        },
    });

    return { success: true, subscriber };
}

export async function getSubscribers(limit?: number) {
    return await prisma.marketingSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: limit || 100, // Membatasi output untuk mencegah OOM
    });
}

export async function deleteSubscriber(id: string) {
    await prisma.marketingSubscriber.delete({
        where: { id },
    });
}



// --- Promotions (Posters/Banners) ---

export async function getPromotions(onlyActive = false, limit?: number) {
    return await prisma.promotion.findMany({
        where: onlyActive ? { 
            isActive: true,
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ]
        } : {},
        orderBy: { createdAt: "desc" },
        take: limit || 100, // Membatasi output untuk mencegah OOM
    });
}

export async function createPromotion(data: {
    title: string;
    description?: string;
    imageUrl: string;
    ctaText?: string;
    ctaUrl?: string;
    couponCode?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    const promotion = await prisma.promotion.create({
        data,
    });
    revalidatePath("/admin/marketing");
    revalidatePath("/promosi");
    return promotion;
}

export async function updatePromotion(id: string, data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaUrl: string;
    couponCode: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}>) {
    const promotion = await prisma.promotion.update({
        where: { id },
        data,
    });

    revalidatePath("/admin/marketing");
    revalidatePath("/promosi");
    return promotion;
}

export async function deletePromotion(id: string) {
    await prisma.promotion.delete({ where: { id } });
    revalidatePath("/admin/marketing");
    revalidatePath("/promosi");
}


