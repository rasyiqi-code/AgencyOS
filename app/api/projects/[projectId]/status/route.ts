
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { stackServerApp } from "@/lib/config/stack";

export async function PATCH(req: NextRequest, props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    // Auth check: hanya admin yang boleh mengubah status project
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { status } = body;

        const validStatuses = ["queue", "dev", "review", "done"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const project = await prisma.project.update({
            where: { id: params.projectId },
            data: { status }
        });

        // --- Notifications ---
        try {
            const stackUser = await stackServerApp.getUser(project.userId);
            if (stackUser && stackUser.primaryEmail) {
                const { sendProjectStatusUpdateEmail } = await import("@/lib/email/client-notifications");
                sendProjectStatusUpdateEmail({
                    to: stackUser.primaryEmail,
                    customerName: stackUser.displayName || stackUser.primaryEmail.split('@')[0] || "Client",
                    projectId: project.id,
                    projectTitle: project.title,
                    newStatus: status
                }).catch(err => console.error("Project status notification error:", err));
            }
        } catch (err) {
            console.error("Failed to fetch user for project status notification:", err);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Project Status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
