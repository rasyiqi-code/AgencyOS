import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createTicketSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    initialMessage: z.string().min(1),
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
                messages: {
                    create: {
                        sender: "user",
                        content: body.initialMessage
                    }
                }
            },
            include: {
                messages: true
            }
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Create Ticket Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
