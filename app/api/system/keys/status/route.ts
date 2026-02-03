import { NextResponse } from "next/server";
import { isAIConfigured } from "@/app/genkit/ai";

export async function GET() {
    return NextResponse.json({
        configured: await isAIConfigured()
    });
}
