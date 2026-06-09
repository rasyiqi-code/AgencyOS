// revalidatePath/revalidateTag tidak diperlukan di TanStack Start
import { prisma } from "@/lib/config/db";
import { isAdmin, getCurrentUser } from "@/lib/shared/auth-helpers";

export async function createChangelog(data: { title: string; content: string; version: string; status: string }) {
    if (!await isAdmin()) throw new Error("Unauthorized");

    const user = await getCurrentUser();

    await prisma.changelog.create({
        data: {
            ...data,
            authorName: user?.displayName || 'Admin',
            publishedAt: new Date()
        }
    });
    return { success: true };
}

export async function updateChangelog(id: string, data: { title: string; content: string; version: string; status: string }) {
    if (!await isAdmin()) throw new Error("Unauthorized");

    await prisma.changelog.update({
        where: { id },
        data
    });
    return { success: true };
}

export async function deleteChangelog(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");

    await prisma.changelog.delete({
        where: { id }
    });
    return { success: true };
}
