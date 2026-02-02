import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const headersList = await headers();

    // 1. Try to get locale from middleware header (URL slug)
    // 2. Fallback to cookie
    // 3. Fallback to 'en'
    const headerLocale = headersList.get('x-next-intl-locale');
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

    const rawLocale = headerLocale || cookieLocale || 'en';
    const locale = rawLocale.slice(0, 2); // Normalize

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
