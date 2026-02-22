import { NextRequest, NextResponse } from "next/server";
import { productGeneratorFlow } from "@/app/genkit";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { description } = body;

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        const result = await productGeneratorFlow(description);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Product Generation Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate product draft" },
            { status: 500 }
        );
    }
}
