"use server";

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
    await prisma.coupon.create({
        data: {
            code: data.code.toUpperCase(),
            discountType: data.discountType,
            discountValue: data.discountValue,
            maxUses: data.maxUses,
            expiresAt: data.expiresAt,
        },
    });
    revalidatePath("/admin/marketing");
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
    await prisma.marketingBonus.create({
        data,
    });
    revalidatePath("/admin/marketing");
}

export async function deleteBonus(id: string) {
    await prisma.marketingBonus.delete({ where: { id } });
    revalidatePath("/admin/marketing");
}

export async function toggleBonusStatus(id: string, isActive: boolean) {
    await prisma.marketingBonus.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath("/admin/marketing");
}

export async function createSubscriber(email: string, name?: string) {
    // Check if exists
    const existing = await prisma.marketingSubscriber.findUnique({
        where: { email },
    });

    if (existing) return; // Already subscribed

    await prisma.marketingSubscriber.create({
        data: {
            email,
            name,
        },
    });
}
