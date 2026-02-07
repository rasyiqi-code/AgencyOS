import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
// Trigger re-lint
import { NextResponse } from "next/server";

export async function GET() {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return NextResponse.json(notifications);
}

export async function PATCH(req: Request) {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, all } = await req.json();

    if (all) {
        await prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true }
        });
        return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const notification = await prisma.notification.update({
        where: { id, userId: user.id },
        data: { isRead: true }
    });

    return NextResponse.json(notification);
}
