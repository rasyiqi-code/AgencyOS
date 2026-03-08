import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/server/leads";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firstName, email, source, path, locale } = body;

        if (!firstName || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

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
