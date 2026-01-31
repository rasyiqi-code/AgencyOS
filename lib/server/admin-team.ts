import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function grantPermission(userId: string, email: string, key: string) {
    if (!await isAdmin()) {
        throw new Error("Unauthorized");
    }

    await prisma.userPermission.upsert({
        where: {
            userId_key: {
                userId,
                key
            }
        },
        create: {
            userId,
            email,
            key
        },
        update: {}
    });

    revalidatePath('/admin/team');
    return { success: true };
}

export async function revokePermission(userId: string, key: string) {
    if (!await isAdmin()) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.userPermission.delete({
            where: {
                userId_key: {
                    userId,
                    key
                }
            }
        });
    } catch {
        // Ignore
    }

    revalidatePath('/admin/team');
    return { success: true };
}
