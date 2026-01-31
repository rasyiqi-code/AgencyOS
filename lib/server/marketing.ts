import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Coupons ---

export async function getCoupons() {
    return await prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createCoupon(data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUses?: number;
    expiresAt?: Date;
}) {
    const coupon = await prisma.coupon.create({
        data: {
            code: data.code.toUpperCase(),
            discountType: data.discountType,
            discountValue: data.discountValue,
            maxUses: data.maxUses,
            expiresAt: data.expiresAt,
        },
    });
    revalidatePath("/admin/marketing");
    return coupon;
}

export async function deleteCoupon(id: string) {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/marketing");
}

export async function validateCoupon(code: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon) return { valid: false, message: "Invalid coupon code." };
    if (!coupon.isActive) return { valid: false, message: "Coupon is inactive." };
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return { valid: false, message: "Coupon has expired." };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, message: "Coupon usage limit reached." };

    return { valid: true, coupon };
}

// --- Bonuses ---

export async function getBonuses() {
    return await prisma.marketingBonus.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createBonus(data: {
    title: string;
    description?: string;
    value?: string;
    icon?: string;
}) {
    const bonus = await prisma.marketingBonus.create({
        data,
    });
    revalidatePath("/admin/marketing");
    return bonus;
}

export async function deleteBonus(id: string) {
    await prisma.marketingBonus.delete({ where: { id } });
    revalidatePath("/admin/marketing");
}

export async function toggleBonusStatus(id: string, isActive: boolean) {
    const bonus = await prisma.marketingBonus.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath("/admin/marketing");
    return bonus;
}

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

export async function getSubscribers() {
    return await prisma.marketingSubscriber.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function deleteSubscriber(id: string) {
    await prisma.marketingSubscriber.delete({
        where: { id },
    });
}

export async function getPromotionCoupon() {
    // Ambil kupon aktif terbaru (bisa difilter lebih lanjut jika perlu)
    return await prisma.coupon.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });
}
