import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        interface SquadProfileWithExtras {
            id: string;
            userId: string;
            name: string;
            role: string;
            yearsOfExp: number;
            specialty?: string | null;
            avatar?: string | null;
        }

        const experts = await prisma.squadProfile.findMany({
            where: { status: 'vetted' },
            orderBy: { name: 'asc' }
        }) as unknown as SquadProfileWithExtras[];

        // Fetch users from Stack to get their real profile images
        interface StackUser {
            id: string;
            profileImageUrl?: string;
        }
        let stackUsers: StackUser[] = [];
        try {
            stackUsers = await stackServerApp.listUsers() as unknown as StackUser[];
        } catch (e) {
            console.error("Failed to list stack users:", e);
        }

        const formattedExperts = experts.map(expert => {
            const stackUser = stackUsers.find(u => u.id === expert.userId);
            return {
                id: expert.id,
                name: expert.name,
                role: expert.role,
                specialty: expert.specialty || "Expert",
                exp: `${expert.yearsOfExp}+ Years`,
                image: stackUser?.profileImageUrl || expert.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=random`
            };
        });

        return NextResponse.json(formattedExperts);
    } catch (error) {
        console.error("Failed to fetch experts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
