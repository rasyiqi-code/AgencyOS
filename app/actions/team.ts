"use server";

import { prisma } from "@/lib/config/db";
import { isAdmin, getCurrentUser } from "@/lib/shared/auth-helpers";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { grantPermission, revokePermission } from "@/lib/server/admin-team";
import { revalidatePath } from "next/cache";

/**
 * Mengelola izin tim agensi (menambahkan atau mencabut role Admin/PM/Finance/Developer).
 */
export async function manageTeamPermission(
    userId: string,
    email: string,
    key: string,
    action: "grant" | "revoke"
) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await getCurrentUser();

        if (user?.id === userId) {
            return { success: false, error: "Admin cannot manage their own permissions to prevent accidental lockout." };
        }

        if (action === 'grant') {
            await grantPermission(userId, email, key);
        } else if (action === 'revoke') {
            await revokePermission(userId, key);
        } else {
            return { success: false, error: "Invalid action" };
        }

        revalidatePath('/admin/team');
        return { success: true };
    } catch (error) {
        console.error("Admin team action error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Internal Error" };
    }
}

export async function getSquadDevelopers() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const permissions = await prisma.userPermission.findMany({
            where: { key: 'developer' },
            orderBy: { email: 'asc' },
            select: {
                userId: true,
                email: true
            }
        });

        const developers = permissions.map(p => ({
            id: p.userId,
            displayName: `${p.email.split('@')[0]} (Developer)`,
            primaryEmail: p.email,
        }));

        return { success: true, data: developers };
    } catch (error) {
        console.error("Failed to fetch developers:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
