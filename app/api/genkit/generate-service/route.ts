import { NextRequest, NextResponse } from "next/server";
import { serviceGeneratorFlow } from "@/app/genkit";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya admin yang boleh generate service content via AI
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { description } = body;

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        const result = await serviceGeneratorFlow(description);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Service Generation Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate service content" },
            { status: 500 }
        );
    }
}
