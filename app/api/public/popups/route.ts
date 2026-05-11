import { NextResponse } from "next/server";
import { getActivePopUps } from "@/lib/server/popups";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const popups = await getActivePopUps();
        return NextResponse.json(popups);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
