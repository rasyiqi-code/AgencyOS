import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";

export async function getPopUps() {
    return await prisma.popUp.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getActivePopUps() {
    return await prisma.popUp.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function createPopUp(data: {
    headline: string;
    headline_id?: string;
    description: string;
    description_id?: string;
    ctaText?: string;
    ctaText_id?: string;
    ctaUrl?: string;
    isActive?: boolean;
    targetingType?: string;
    targetingPaths?: string[];
    targetingLocales?: string[];
    showFormLead?: boolean;
    formHeadline?: string;
    formHeadline_id?: string;
    delay?: number;
    couponCode?: string;
}) {
    const popup = await prisma.popUp.create({
        data: {
            ...data,
            targetingPaths: data.targetingPaths || [],
            targetingLocales: data.targetingLocales || [],
        },
    });
    revalidatePath("/admin/marketing");
    return popup;
}

export async function updatePopUp(id: string, data: Partial<Parameters<typeof createPopUp>[0]>) {
    const popup = await prisma.popUp.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/marketing");
    return popup;
}

export async function deletePopUp(id: string) {
    await prisma.popUp.delete({ where: { id } });
    revalidatePath("/admin/marketing");
}

export async function togglePopUpStatus(id: string, isActive: boolean) {
    const popup = await prisma.popUp.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath("/admin/marketing");
    return popup;
}
