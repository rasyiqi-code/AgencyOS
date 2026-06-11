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

        if (key === 'developer') {
            if (action === 'grant') {
                const existingProfile = await prisma.squadProfile.findUnique({
                    where: { userId }
                });

                if (existingProfile) {
                    await prisma.squadProfile.update({
                        where: { userId },
                        data: { status: 'vetted' }
                    });
                } else {
                    let targetName = email.split('@')[0];
                    try {
                        const targetUser = await hexclaveServerApp.getUser(userId);
                        if (targetUser?.displayName) {
                            targetName = targetUser.displayName;
                        }
                    } catch {
                        console.warn(`[ADMIN_TEAM] Could not fetch user ${userId}, using email as name.`);
                    }

                    await prisma.squadProfile.create({
                        data: {
                            userId,
                            email,
                            name: targetName,
                            role: 'engineer',
                            yearsOfExp: 0,
                            skills: [],
                            status: 'vetted'
                        }
                    });
                }
            } else if (action === 'revoke') {
                await prisma.squadProfile.update({
                    where: { userId },
                    data: { status: 'rejected' }
                });
            }
        } else {
            if (action === 'grant') {
                await grantPermission(userId, email, key);
            } else if (action === 'revoke') {
                await revokePermission(userId, key);
            } else {
                return { success: false, error: "Invalid action" };
            }
        }

        revalidatePath('/admin/team');
        return { success: true };
    } catch (error) {
        console.error("Admin team action error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Internal Error" };
    }
}

/**
 * Mengambil daftar developer tim agensi yang terdaftar untuk penugasan project.
 */
export async function getSquadDevelopers() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const profiles = await prisma.squadProfile.findMany({
            where: { status: 'vetted' }, // Hanya developer yang sudah vetted
            orderBy: { name: 'asc' },
            select: {
                userId: true,
                name: true,
                email: true,
                role: true
            }
        });

        const developers = profiles.map(p => ({
            id: p.userId,
            displayName: `${p.name} (${p.role})`,
            primaryEmail: p.email,
        }));

        return { success: true, data: developers };
    } catch (error) {
        console.error("Failed to fetch squad profiles:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
