
import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { getAppUrl } from "@/lib/shared/url";
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
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch User Profile to get account name and ID
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });

        const userData = await userResponse.json();

        // 3. Save or Update in Database
        await (prisma as unknown as PrismaWithIntegration).systemIntegration.upsert({
            where: { provider: "github" },
            update: {
                accessToken,
                accountName: userData.login,
                accountId: userData.id.toString(),
                isActive: true,
                metadata: {
                    avatar_url: userData.avatar_url,
                    html_url: userData.html_url,
                }
            },
            create: {
                provider: "github",
                accessToken,
                accountName: userData.login,
                accountId: userData.id.toString(),
                isActive: true,
                metadata: {
                    avatar_url: userData.avatar_url,
                    html_url: userData.html_url,
                }
            }
        });

        // 4. Redirect back to admin integrations page
        // 4. Redirect back to admin integrations page
        return NextResponse.redirect(`${getAppUrl()}/admin/system/integrations?success=github`);
    } catch (error: unknown) {
        console.error("GitHub OAuth Error:", error);
        const errorMessage = error instanceof Error ? error.message : "GitHub authentication failed";
        return NextResponse.redirect(`${getAppUrl()}/admin/system/integrations?error=${encodeURIComponent(errorMessage)}`);
    }
}
