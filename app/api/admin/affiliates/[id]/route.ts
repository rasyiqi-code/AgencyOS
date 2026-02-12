import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/admin/affiliates/[id]
 * Admin: Update commission rate dan status affiliate.
 * Body: { commissionRate?: number, status?: string }
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Admin check: cek ADMIN_EMAILS dan SUPER_ADMIN_ID
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const superAdminId = process.env.SUPER_ADMIN_ID;
        const isSuperAdmin = (user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId;

        if (!isSuperAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { commissionRate, status } = body as {
            commissionRate?: number;
            status?: string;
        };

        // Validasi input
        const updateData: Record<string, unknown> = {};

        if (commissionRate !== undefined) {
            if (commissionRate < 0 || commissionRate > 100) {
                return NextResponse.json({ error: "Commission rate must be between 0-100" }, { status: 400 });
            }
            updateData.commissionRate = commissionRate;
        }

        if (status !== undefined) {
            const validStatuses = ["pending", "active", "suspended"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: `Status must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
            }
            updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updated = await prisma.affiliateProfile.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, affiliate: updated });
    } catch (error) {
        console.error("Admin Affiliate Update Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
