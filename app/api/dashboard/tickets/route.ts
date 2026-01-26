import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    let user;
    try {
        user = await stackServerApp.getUser();
    } catch (error) {
        console.error("Stack Auth Error:", error);
        // Continue as "guest" or fail depending on logic.
        // For dashboard tickets, we probably need auth.
        return NextResponse.json({ error: "Authentication Service Error" }, { status: 401 });
    }

    // In real app, check if user is admin/staff
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tickets = await prisma.ticket.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("List Tickets Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
