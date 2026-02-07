import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Fetch Ticket Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
