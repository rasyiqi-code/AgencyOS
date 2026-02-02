import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'chat' or 'ticket'

    let user;
    try {
        user = await stackServerApp.getUser();
    } catch (error) {
        console.error("Stack Auth Error:", error);
        return NextResponse.json({ error: "Authentication Service Error" }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tickets = await prisma.ticket.findMany({
            where: {
                userId: user.id,
                ...(type ? { type } : {})
            } as Prisma.TicketWhereInput,
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
