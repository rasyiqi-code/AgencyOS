import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an HTML string to prevent Cross-Site Scripting (XSS) attacks.
 * Safe to use in both Server Components and Client Components in Next.js.
 * 
 * @param html Original dirty HTML string
 * @returns Cleaned and safe HTML string
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true }
    });
}
