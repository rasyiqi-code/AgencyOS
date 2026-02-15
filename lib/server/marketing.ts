import { prisma } from "@/lib/config/db";
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
    appliesTo?: string[];
}) {
    const coupon = await prisma.coupon.create({
        data: {
            code: data.code.toUpperCase(),
            discountType: data.discountType,
            discountValue: data.discountValue,
            maxUses: data.maxUses,
            expiresAt: data.expiresAt,
            appliesTo: data.appliesTo || ["DIGITAL", "SERVICE", "CALCULATOR"],
        },
    });
    revalidatePath("/admin/marketing");
    return coupon;
}

export async function deleteCoupon(id: string) {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/marketing");
}

export async function validateCoupon(code: string, context?: "DIGITAL" | "SERVICE" | "CALCULATOR") {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon) return { valid: false, message: "Invalid coupon code." };
    if (!coupon.isActive) return { valid: false, message: "Coupon is inactive." };
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return { valid: false, message: "Coupon has expired." };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, message: "Coupon usage limit reached." };

    if (context && coupon.appliesTo && !coupon.appliesTo.includes(context)) {
        return { valid: false, message: `Coupon is not valid for ${context.toLowerCase()}.` };
    }

    // Hanya validasi, TIDAK increment usedCount
    // Gunakan applyCoupon() saat coupon benar-benar digunakan (checkout)
    return { valid: true, coupon };
}

/**
 * Gunakan coupon — increment usedCount secara atomik.
 * Panggil fungsi ini HANYA saat coupon benar-benar digunakan (saat checkout berhasil).
 */
export async function applyCoupon(code: string) {
    const validation = await validateCoupon(code);
    if (!validation.valid) return validation;

    // Increment usedCount secara atomik
    const updatedCoupon = await prisma.coupon.update({
        where: { code: code.toUpperCase() },
        data: { usedCount: { increment: 1 } },
    });

    return { valid: true, coupon: updatedCoupon };
}

// --- Bonuses ---

export async function getBonuses(context?: "DIGITAL" | "SERVICE" | "CALCULATOR") {
    return await prisma.marketingBonus.findMany({
        where: {
            isActive: true,
            ...(context ? { appliesTo: { has: context } } : {})
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createBonus(data: {
    title: string;
    description?: string;
    value?: string;
    icon?: string;
    appliesTo?: string[];
}) {
    const bonus = await prisma.marketingBonus.create({
        data: {
            ...data,
            appliesTo: data.appliesTo || ["DIGITAL", "SERVICE", "CALCULATOR"]
        },
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

export async function getPromotionCoupon(context?: "DIGITAL" | "SERVICE" | "CALCULATOR") {
    // Ambil kupon aktif terbaru (bisa difilter lebih lanjut jika perlu)
    return await prisma.coupon.findFirst({
        where: {
            isActive: true,
            ...(context ? { appliesTo: { has: context } } : {})
        },
        orderBy: { createdAt: "desc" },
    });
}
