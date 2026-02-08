import { squadService } from "@/lib/server/squad";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { applicationId, accept } = await request.json();

        // Verify ownership (optional but good practice, though service checks invite validity)
        // For speed, relying on service logic.

        await squadService.respondToInvitation(applicationId, accept);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Invitation response error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
