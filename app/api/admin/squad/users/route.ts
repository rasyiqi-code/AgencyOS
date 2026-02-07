
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { NextResponse } from "next/server";

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const profiles = await prisma.squadProfile.findMany({
            orderBy: { name: 'asc' },
            select: {
                userId: true,
                name: true,
                email: true,
                role: true
            }
        });

        // Map to Developer interface expected by selector
        const developers = profiles.map(p => ({
            id: p.userId,
            displayName: `${p.name} (${p.role})`, // Include role for context
            primaryEmail: p.email,
        }));

        return NextResponse.json(developers);
    } catch (error) {
        console.error("Failed to fetch squad profiles:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
