
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function GET() {
    if (!await isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;

    if (!clientId) {
        return NextResponse.json({ error: "GITHUB_CLIENT_ID not configured" }, { status: 500 });
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user&state=github_oauth`;

    return NextResponse.redirect(githubAuthUrl);
}
