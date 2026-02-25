import { stackServerApp } from "@/lib/config/stack";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Identify Locale and Clean Path
    const locales = ['en', 'id'];
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    let locale = 'en'; // Default fallback
    let cleanPathname = pathname;

    if (pathnameHasLocale) {
        const pathLocale = pathname.split('/')[1];
        if (locales.includes(pathLocale)) {
            locale = pathLocale;
            cleanPathname = pathname.replace(`/${locale}`, '') || '/';
        }
    }

    // 2. Auth Check (Dashboard) - Check on CLEAN pathname to cover /id/dashboard etc.
    if (cleanPathname.startsWith("/dashboard")) {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.redirect(new URL("/handler/sign-in", request.url));
        }
    }

    // 3. Logic for paths WITHOUT locale (e.g. /, /squad)
    if (!pathnameHasLocale) {
        // Detect preference: Cookie > Browser > Geo > Default
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
        const acceptLanguage = request.headers.get('accept-language');
        const geoCountry = (request as NextRequest & { geo?: { country?: string } }).geo?.country || request.headers.get('x-vercel-ip-country');

        let targetLocale = 'en';
        let browserLocale = null;

        if (acceptLanguage) {
            // Extract code: en-US,en;q=0.9,id;q=0.8
            const preferredLocales = acceptLanguage
                .split(',')
                .map(lang => lang.split(';')[0].trim().slice(0, 2).toLowerCase());

            browserLocale = preferredLocales.find(lang => locales.includes(lang));
        }

        if (cookieLocale && locales.includes(cookieLocale)) {
            targetLocale = cookieLocale;
        } else if (browserLocale) {
            targetLocale = browserLocale;
        } else if (geoCountry === 'ID') {
            targetLocale = 'id';
        }

        // Redirect to localized path
        const url = new URL(`/${targetLocale}${pathname === '/' ? '' : pathname}`, request.url);
        request.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });
        return NextResponse.redirect(url);
    }

    // 4. Logic for paths WITH locale (Rewrite to clean path)
    const url = new URL(cleanPathname, request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const response = NextResponse.rewrite(url);
    response.headers.set('x-next-intl-locale', locale);
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' }); // Functionally redundant if only reading, but good for enforcing consistency

    return response;
}

export const config = {
    // Removed 'squad' from exclusions to allow localization
    matcher: ['/((?!api|admin|static|.*\\..*|_next|handler|genkit|test).*)']
};
