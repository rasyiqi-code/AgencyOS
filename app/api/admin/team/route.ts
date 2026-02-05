import { NextRequest, NextResponse } from "next/server";
import { grantPermission, revokePermission } from "@/lib/server/admin-team";
import { isAdmin } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { userId, email, key, action } = await req.json();

        if (action === 'grant') {
            await grantPermission(userId, email, key);
        } else if (action === 'revoke') {
            await revokePermission(userId, key);
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin team API error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
