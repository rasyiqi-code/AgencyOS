"use server";

import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { getBonuses, createBonus, deleteBonus, toggleBonusStatus, getCoupons, createCoupon, deleteCoupon, getSubscribers, deleteSubscriber, getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/lib/server/marketing";
import { getLeads, deleteLead } from "@/lib/server/leads";
import { getPopUps, createPopUp, updatePopUp, deletePopUp, togglePopUpStatus } from "@/lib/server/popups";
import { uploadFile } from "@/lib/integrations/storage";
import { broadcastPushNotification } from "@/lib/server/push";

// ─── Bonuses ───

export async function getBonusesAction() {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        return { success: true, data: await getBonuses() };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function createBonusAction(data: {
    title: string;
    description?: string;
    value?: string;
    icon?: string;
    appliesTo?: string[];
}) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        const bonus = await createBonus(data);
        revalidatePath("/admin/marketing");
        return { success: true, data: bonus };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteBonusAction(id: string) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        await deleteBonus(id);
        revalidatePath("/admin/marketing");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function toggleBonusStatusAction(id: string, isActive: boolean) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        const bonus = await toggleBonusStatus(id, isActive);
        revalidatePath("/admin/marketing");
        return { success: true, data: bonus };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── Coupons ───

export async function getCouponsAction() {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        return { success: true, data: await getCoupons() };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function createCouponAction(data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUses?: number;
    expiresAt?: Date;
    appliesTo?: string[];
}) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        const coupon = await createCoupon(data);
        revalidatePath("/admin/marketing");
        return { success: true, data: coupon };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteCouponAction(id: string) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        await deleteCoupon(id);
        revalidatePath("/admin/marketing");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── Leads ───

export async function getLeadsAction() {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        return { success: true, data: await getLeads() };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteLeadAction(id: string) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        await deleteLead(id);
        revalidatePath("/admin/marketing");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── PopUps ───

export async function getPopUpsAction() {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        return { success: true, data: await getPopUps() };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function createPopUpAction(data: Parameters<typeof createPopUp>[0]) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        const popup = await createPopUp(data);
        revalidatePath("/admin/marketing");
        return { success: true, data: popup };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updatePopUpAction(id: string, data: Parameters<typeof updatePopUp>[1]) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        const popup = await updatePopUp(id, data);
        revalidatePath("/admin/marketing");
        return { success: true, data: popup };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deletePopUpAction(id: string) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        await deletePopUp(id);
        revalidatePath("/admin/marketing");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function togglePopUpStatusAction(id: string, isActive: boolean) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        const popup = await togglePopUpStatus(id, isActive);
        revalidatePath("/admin/marketing");
        return { success: true, data: popup };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── Subscribers ───

export async function getSubscribersAction() {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        return { success: true, data: await getSubscribers() };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteSubscriberAction(id: string) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        await deleteSubscriber(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── Upload Asset ───

export async function uploadAssetAction(formData: FormData) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");

        const file = formData.get("file") as File;
        if (!file) throw new Error("No file provided");

        const path = `marketing/assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const url = await uploadFile(file, path);

        return { success: true, data: { url } };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── Push ───

export async function broadcastPushAction(data: {
    title: string;
    body: string;
    url?: string;
    targetEndpoints?: string[];
}) {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");

        const { title, body: content, url, targetEndpoints } = data;

        if (!title || !content) throw new Error("Title and content are required");

        const where = targetEndpoints && targetEndpoints.length > 0
            ? { endpoint: { in: targetEndpoints } }
            : {};

        const subscriptions = await prisma.pushSubscription.findMany({ where });

        if (subscriptions.length === 0) {
            return { success: true, data: { count: 0, message: "No subscribers found" } };
        }

        const pushSubs = subscriptions.map(s => ({
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth }
        }));

        const result = await broadcastPushNotification(pushSubs, {
            title,
            body: content,
            url: url || process.env.NEXT_PUBLIC_APP_URL,
        });

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getPushStatsAction() {
    try {
        if (!await isAdmin()) throw new Error("Unauthorized");

        const totalSubscribers = await prisma.pushSubscription.count();
        const engagementRate = 0;

        return {
            success: true,
            data: { subscribers: totalSubscribers, engagement: engagementRate }
        };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ─── Promotions (legacy — used by promotions-manager, throws on error) ───

export async function getAdminPromotions() {
    if (!await isAdmin()) throw new Error("Unauthorized");
    return await getPromotions(false);
}

export async function createPromotionAction(data: {
    title: string;
    description?: string;
    imageUrl: string;
    ctaText?: string;
    ctaUrl?: string;
    couponCode?: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
}) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    return await createPromotion({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
}

export async function updatePromotionAction(id: string, data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
    couponCode?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
}) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    return await updatePromotion(id, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
}

export async function deletePromotionAction(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    await deletePromotion(id);
}

// ─── Assets (legacy — used by assets-manager, throws on error) ───

export async function getAdminAssets(page = 1, limit = 100, type?: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    if (!((user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId)) {
        throw new Error("Forbidden");
    }

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (page - 1) * safeLimit;

    return await prisma.marketingAsset.findMany({
        where: type ? { type } : undefined,
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        skip: skip,
    });
}

export async function createAsset(data: {
    type: string;
    title: string;
    content?: string;
    imageUrl?: string;
    category?: string;
    metadata?: Record<string, unknown>;
}) {
    if (!await isAdmin()) throw new Error("Unauthorized");

    return await prisma.marketingAsset.create({
        data: {
            type: data.type,
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl,
            category: data.category,
            metadata: data.metadata as Prisma.InputJsonValue
        }
    });
}

export async function updateAsset(id: string, data: {
    title?: string;
    content?: string;
    imageUrl?: string;
    category?: string;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
}) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    if (!((user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId)) {
        throw new Error("Forbidden");
    }

    const { metadata, ...rest } = data;

    return await prisma.marketingAsset.update({
        where: { id },
        data: {
            ...rest,
            metadata: metadata as Prisma.InputJsonValue
        }
    });
}

export async function deleteAsset(id: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    if (!((user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId)) {
        throw new Error("Forbidden");
    }

    await prisma.marketingAsset.delete({ where: { id } });
}
