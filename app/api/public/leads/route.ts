import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/server/leads";
import { z } from "zod";

const leadSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
    email: z.string().email("Invalid email address").max(255, "Email is too long"),
    source: z.string().max(100).optional(),
    path: z.string().max(255).optional(),
    locale: z.string().max(10).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = leadSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { firstName, email, source, path, locale } = validationResult.data;

        const lead = await createLead({
            firstName,
            email,
            source: source || "popup",
            path,
            locale
        });

        return NextResponse.json({ success: true, data: lead });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
