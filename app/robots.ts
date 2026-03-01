
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
        rules: [
            // Default rule for all crawlers
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/dashboard/', '/api/'],
            },
            // Explicit allow for AI search engine crawlers (GEO)
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'anthropic-ai', allow: '/' },
            { userAgent: 'Claude-Web', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
