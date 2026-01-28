
import { stackServerApp } from "@/lib/stack";
import { isAdmin } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await stackServerApp.listUsers();
        // Simply return the list of users with relevant fields
        const simplifiedUsers = users.map((u: { id: string; displayName?: string | null; primaryEmail?: string | null }) => ({
            id: u.id,
            displayName: u.displayName,
            primaryEmail: u.primaryEmail,
        }));

        return NextResponse.json(simplifiedUsers);
    } catch (error) {
        console.error("Failed to fetch users from Stack Auth:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
