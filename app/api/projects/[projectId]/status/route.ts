
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

export async function PATCH(req: NextRequest, props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { status } = body;

        const validStatuses = ["queue", "dev", "review", "done"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await prisma.project.update({
            where: { id: params.projectId },
            data: { status }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Project Status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
