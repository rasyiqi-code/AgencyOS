"use server";

import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { getSubscribers, deleteSubscriber, getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/lib/server/marketing";
import { getLeads, deleteLead } from "@/lib/server/leads";
import { getPopUps, createPopUp, updatePopUp, deletePopUp, togglePopUpStatus } from "@/lib/server/popups";
import { uploadFile } from "@/lib/integrations/storage";


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

export async function broadcastPushAction(_data: {
    title: string;
    body: string;
    url?: string;
    targetEndpoints?: string[];
}) {
    return { success: true, data: { count: 0, message: "Push notifications disabled" } };
}

export async function getPushStatsAction() {
    return {
        success: true,
        data: { subscribers: 0, engagement: 0 }
    };
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


