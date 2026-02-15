
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { getAppUrl } from "@/lib/shared/url";

export async function GET() {
    if (!await isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${getAppUrl()}/api/integrations/github/callback`;

    if (!clientId) {
        return NextResponse.json({ error: "GITHUB_CLIENT_ID not configured" }, { status: 500 });
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user&state=github_oauth`;

    return NextResponse.redirect(githubAuthUrl);
}
