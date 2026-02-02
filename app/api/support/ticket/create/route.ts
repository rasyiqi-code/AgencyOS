import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createTicketSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    initialMessage: z.string().min(1),
    type: z.enum(["chat", "ticket"]).default("ticket"),
});

export async function POST(request: Request) {
    const user = await stackServerApp.getUser();

    try {
        const json = await request.json();
        const body = createTicketSchema.parse(json);

        // If user is logged in, use their ID. If not, require email.
        if (!user && !body.email) {
            return NextResponse.json({ error: "Email is required for guests" }, { status: 400 });
        }

        const ticket = await prisma.ticket.create({
            data: {
                userId: user?.id,
                email: body.email,
                name: body.name,
                type: body.type,
                messages: {
                    create: {
                        sender: "user",
                        content: body.initialMessage
                    }
                }
            } as Prisma.TicketUncheckedCreateInput,
            include: {
                messages: true
            }
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error: unknown) { // Changed 'error' to 'error: unknown' for explicit type safety
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        // Safely handle other errors
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Create Ticket Error:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
