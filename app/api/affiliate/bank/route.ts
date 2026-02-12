
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";

export async function POST(req: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { bankName, accountNumber, accountHolder } = body;

        if (!bankName || !accountNumber || !accountHolder) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const bankInfo = { bankName, accountNumber, accountHolder };

        await prisma.affiliateProfile.update({
            where: { userId: user.id },
            data: {
                bankInfo: bankInfo
            }
        });

        return NextResponse.json({ success: true, data: bankInfo });
    } catch (error) {
        console.error("Update Bank Details Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
