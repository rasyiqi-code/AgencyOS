import { getServices } from "@/lib/server/services";
import { getDigitalProducts } from "@/app/actions/digital-products";
import { getPortfolios } from "@/lib/portfolios/actions";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface SitemapRoute {
    route: string;
    lastModified: Date | string | number;
    changeFrequency: string;
    priority: number;
}

export async function GET() {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const locales = ["id", "en"];
    const now = new Date();

    // 1. Fetch Data
    const [portfolios, products, services] = await Promise.all([
        getPortfolios(),
        getDigitalProducts(true),
        getServices(true),
    ]);

    // 2. Define Static Routes
    const staticPaths = [
        "",
        "/services",
        "/portfolio",
        "/products",
        "/contact",
        "/experts",
        "/price-calculator",
        "/submit-testimonial",
        "/promosi",
        "/docs",
        "/privacy",
        "/terms",
    ];

    const baseRoutes: SitemapRoute[] = [];

    // Static Routes
    for (const route of staticPaths) {
        baseRoutes.push({
            route,
            lastModified: now,
            changeFrequency: "weekly",
            priority: route === "" ? 1 : 0.8,
        });
    }

    // Portfolio Routes
    for (const portfolio of portfolios) {
        baseRoutes.push({
            route: `/view-design/${portfolio.slug}`,
            lastModified: portfolio.createdAt as Date | string | number,
            changeFrequency: "monthly",
            priority: 0.7,
        });
    }

    // Product Routes
    for (const product of products) {
        baseRoutes.push({
            route: `/products/${product.slug}`,
            lastModified: (product.updatedAt || now) as Date | string | number,
            changeFrequency: "weekly",
            priority: 0.9,
        });
    }

    // Service Routes
    for (const service of services) {
        baseRoutes.push({
            route: `/services/${service.slug}`,
            lastModified: (service.updatedAt || now) as Date | string | number,
            changeFrequency: "weekly",
            priority: 0.8,
        });
    }

    // 3. Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    for (const locale of locales) {
        const prefix = `${baseUrl}/${locale}`;
        for (const baseRoute of baseRoutes) {
            const url = `${prefix}${baseRoute.route}`;
            const lastmod = new Date(baseRoute.lastModified).toISOString();
            
            xml += `  <url>\n`;
            xml += `    <loc>${url}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>${baseRoute.changeFrequency}</changefreq>\n`;
            xml += `    <priority>${baseRoute.priority}</priority>\n`;
            
            // Add Alternates
            for (const altLocale of locales) {
                const altUrl = `${baseUrl}/${altLocale}${baseRoute.route}`;
                xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}"/>\n`;
            }
            
            xml += `  </url>\n`;
        }
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
        },
    });
}
