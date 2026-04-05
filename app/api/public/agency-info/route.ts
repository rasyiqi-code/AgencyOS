import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/server/settings";

export async function GET() {
    try {
        // ⚡ Bolt Optimization: Use cached settings instead of direct DB query
        // 🎯 Why: Prevents unnecessary database queries for static settings
        // 📊 Impact: Eliminates a database query during page loads, reducing SSR time and DB load
        const settings = await getSystemSettings(["AGENCY_NAME"]);

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error("Public Agency Info Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
