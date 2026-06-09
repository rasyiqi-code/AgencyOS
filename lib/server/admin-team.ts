// revalidatePath/revalidateTag tidak diperlukan di TanStack Start
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";

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
return { success: true };
}
