import { NextRequest, NextResponse } from "next/server";
import { createSubscriber } from "@/lib/server/marketing";

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await createSubscriber(email, name);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subscription API error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
