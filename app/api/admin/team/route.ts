import { NextRequest, NextResponse } from "next/server";
import { grantPermission, revokePermission } from "@/lib/server/admin-team";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { userId, email, key, action } = await req.json();
        const user = await stackServerApp.getUser();

        if (user?.id === userId) {
            return NextResponse.json({ error: "Admin cannot manage their own permissions to prevent accidental lockout." }, { status: 400 });
        }

        if (key === 'developer') {
            if (action === 'grant') {
                // Create or activate SquadProfile
                const existingProfile = await prisma.squadProfile.findUnique({
                    where: { userId }
                });

                if (existingProfile) {
                    // Update status ke 'vetted' sebagai state aktif developer
                    await prisma.squadProfile.update({
                        where: { userId },
                        data: { status: 'vetted' }
                    });
                } else {
                    // Ambil data target user dari Stack Auth (bukan admin yang login)
                    let targetName = email.split('@')[0];
                    try {
                        const targetUser = await stackServerApp.getUser(userId);
                        if (targetUser?.displayName) {
                            targetName = targetUser.displayName;
                        }
                    } catch {
                        // Fallback ke email prefix jika gagal fetch target user
                        console.warn(`[ADMIN_TEAM] Could not fetch user ${userId}, using email as name.`);
                    }

                    await prisma.squadProfile.create({
                        data: {
                            userId,
                            email, // Ensure email is passed
                            name: targetName,
                            role: 'engineer', // Default
                            yearsOfExp: 0,
                            skills: [],
                            status: 'vetted'
                        }
                    });
                }
            } else if (action === 'revoke') {
                // Deactivate SquadProfile
                await prisma.squadProfile.update({
                    where: { userId },
                    data: { status: 'rejected' } // Or 'inactive' if we want to add that state
                });
            }
        } else {
            if (action === 'grant') {
                await grantPermission(userId, email, key);
            } else if (action === 'revoke') {
                await revokePermission(userId, key);
            } else {
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin team API error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
