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
        // Detect preference: Cookie > Browser > Geo > IP-API Fallback > Default
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
        const acceptLanguage = request.headers.get('accept-language');
        let geoCountry = (request as NextRequest & { geo?: { country?: string } }).geo?.country || request.headers.get('x-vercel-ip-country');

        // Skip IP-API in development or for localhost to speed up rendering
        const isDev = process.env.NODE_ENV === 'development';
        const isLocalhost = request.headers.get('host')?.includes('localhost');

        // Fallback to IP-API if geo info is missing (for non-Vercel environments)
        if (!geoCountry && !isDev && !isLocalhost) {
            try {
                const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || (request as NextRequest & { ip?: string }).ip;
                if (ip && ip !== '127.0.0.1' && ip !== '::1') {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 500);

                    const ipRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (ipRes.ok) {
                        const data = await ipRes.json();
                        if (data.countryCode) {
                            geoCountry = data.countryCode;
                            console.log(`[Middleware] IP-API detected: ${geoCountry} for IP: ${ip}`);
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    console.warn('[Middleware] IP-API request timed out (500ms)');
                } else {
                    console.error('[Middleware] IP-API error:', err instanceof Error ? err.message : String(err));
                }
            }
        }

        let targetLocale = 'en';
        let browserLocale = null;

        if (acceptLanguage) {
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
