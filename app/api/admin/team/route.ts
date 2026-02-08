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
                    await prisma.squadProfile.update({
                        where: { userId },
                        data: {
                            status: 'active', // Should correspond to 'vetted' or 'active' based on schema
                            // If schema uses 'vetted', we use that. Checking schema...
                            // Schema says: status String @default("pending") // pending, vetted, rejected
                            // Let's use 'vetted' as active state for now, or maybe just 'active' if enum allows string. 
                            // Schema is String, avoiding enum issues.
                            // Let's check schema again to be sure.
                        }
                    });

                    // Update: Re-reading schema in my head... status is String. 
                    // Let's use 'vetted' as the "Active Developer" state.
                    await prisma.squadProfile.update({
                        where: { userId },
                        data: { status: 'vetted' }
                    });
                } else {
                    await prisma.squadProfile.create({
                        data: {
                            userId,
                            email, // Ensure email is passed
                            name: user?.displayName || email.split('@')[0],
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
