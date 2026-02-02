import { stackServerApp } from "@/lib/stack";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Auth Check (Dashboard)
    if (pathname.startsWith("/dashboard")) {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.redirect(new URL("/handler/sign-in", request.url));
        }
    }

    // 2. Localization Logic
    const locales = ['en', 'id'];
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        const locale = pathname.split('/')[1];
        const newPathname = pathname.replace(`/${locale}`, '') || '/';

        const url = new URL(newPathname, request.url);
        request.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        const response = NextResponse.rewrite(url);
        response.headers.set('x-next-intl-locale', locale);
        response.cookies.set('NEXT_LOCALE', locale, { path: '/' });

        return response;
    }

    return NextResponse.next();
}

export const config = {
    // Broad matcher to handle both dashboard and localization
    matcher: ['/((?!api|admin|static|.*\\..*|_next|handler|genkit|test|squad).*)']
};
