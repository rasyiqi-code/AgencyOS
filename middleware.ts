import { stackServerApp } from "@/lib/stack";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const user = await stackServerApp.getUser();

    // 1. Auth Check
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/handler/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Matcher excluding api, _next, static files
    matcher: ['/((?!api|_next|handler|.*\\..*).*)', '/dashboard/:path*']
};
