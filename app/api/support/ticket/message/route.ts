import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const sendMessageSchema = z.object({
    ticketId: z.string(),
    content: z.string().min(1),
    sender: z.enum(["user", "agent"]), // In real app, enforce sender based on auth
});

export async function POST(request: Request) {
    // Basic auth check
    // In a real app, we should verify if the user owns the ticket or is an admin.
    // For now, we allow sending if ticket exists to keep it simple for the MVP demo.

    try {
        const json = await request.json();
        const body = sendMessageSchema.parse(json);

        const message = await prisma.supportMessage.create({
            data: {
                ticketId: body.ticketId,
                sender: body.sender,
                content: body.content,
            }
        });

        // Update ticket "updatedAt"
        await prisma.ticket.update({
            where: { id: body.ticketId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
