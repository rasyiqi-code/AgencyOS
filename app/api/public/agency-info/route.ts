import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: {
                    in: ["AGENCY_NAME"]
                }
            }
        });

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
