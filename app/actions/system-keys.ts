"use server";

import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function getAgencyKeys() {
    if (!await isAdmin()) return [];
    return await prisma.systemKey.findMany({
        where: { provider: "agency-os" },
        orderBy: { createdAt: "desc" }
    });
}

export async function createAgencyKey(label: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    // Generate a secure API Key: gos_...
    const key = `gos_${randomBytes(32).toString('hex')}`;
    
    const newKey = await prisma.systemKey.create({
        data: {
            key,
            provider: "agency-os",
            label,
            isActive: true
        }
    });

    revalidatePath("/admin/system/keys");
    return newKey;
}

export async function toggleAgencyKey(id: string, isActive: boolean) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    await prisma.systemKey.update({
        where: { id },
        data: { isActive }
    });

    revalidatePath("/admin/system/keys");
}

export async function deleteAgencyKey(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    await prisma.systemKey.delete({
        where: { id }
    });

    revalidatePath("/admin/system/keys");
}
