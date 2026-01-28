
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-helpers";

export async function GET() {
    if (!await isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const slug = process.env.VERCEL_INTEGRATION_SLUG;

    if (!slug) {
        return NextResponse.json({ error: "VERCEL_INTEGRATION_SLUG not configured" }, { status: 500 });
    }

    // Vercel Integration Installation URL
    // Try using /new which is common for private integrations
    const vercelAuthUrl = `https://vercel.com/integrations/${slug}/new?state=vercel_oauth`;

    return NextResponse.redirect(vercelAuthUrl);
}
