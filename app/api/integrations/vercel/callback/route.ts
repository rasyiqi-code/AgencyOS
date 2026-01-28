
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth-helpers";
import type { PrismaWithIntegration } from "@/types/payment";

export async function GET(req: Request) {
    if (!await isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await fetch("https://api.vercel.com/v2/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.VERCEL_CLIENT_ID!,
                client_secret: process.env.VERCEL_CLIENT_SECRET!,
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/vercel/callback`,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }

        const accessToken = tokenData.access_token;
        const teamId = tokenData.team_id;
        const userId = tokenData.user_id;

        // 2. Save or Update in Database
        await (prisma as unknown as PrismaWithIntegration).systemIntegration.upsert({
            where: { provider: "vercel" },
            update: {
                accessToken,
                accountId: teamId || userId, // Prefer teamId if available
                accountName: tokenData.installation_id || "Vercel Account",
                isActive: true,
                metadata: {
                    team_id: teamId,
                    user_id: userId,
                    installation_id: tokenData.installation_id,
                }
            },
            create: {
                provider: "vercel",
                accessToken,
                accountId: teamId || userId,
                accountName: tokenData.installation_id || "Vercel Account",
                isActive: true,
                metadata: {
                    team_id: teamId,
                    user_id: userId,
                    installation_id: tokenData.installation_id,
                }
            }
        });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/system/integrations?success=vercel`);
    } catch (error: unknown) {
        console.error("Vercel OAuth Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Vercel authentication failed";
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/system/integrations?error=${encodeURIComponent(errorMessage)}`);
    }
}
