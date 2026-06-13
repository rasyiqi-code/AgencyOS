import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
    let rawLocale = 'en';

    try {
        const cookieStore = await cookies();
        const headersList = await headers();

        // 1. Coba dapatkan locale dari middleware header (URL slug)
        // 2. Jika tidak ada, gunakan cookie
        // 3. Jika tidak ada, gunakan default 'en'
        const headerLocale = headersList.get('x-next-intl-locale');
        const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

        rawLocale = headerLocale || cookieLocale || 'en';
    } catch {
        // Fallback ke default locale jika dipanggil pada saat build/pre-rendering
        rawLocale = 'en';
    }

    const locale = rawLocale.slice(0, 2); // Normalisasi ke 2 karakter pertama

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});

