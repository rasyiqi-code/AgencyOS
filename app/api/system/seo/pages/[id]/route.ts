
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        const page = await prisma.pageSeo.delete({
            where: { id }
        });

        revalidatePath(page.path);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
    }
}
