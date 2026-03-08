import { getDigitalProducts } from "@/app/actions/digital-products";
import { getPortfolios } from "@/lib/portfolios/actions";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Opsional: tetap cache selama 1 jam di runtime

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const locales = ["id", "en"];
    const allRoutes: MetadataRoute.Sitemap = [];

    // Pre-fetch dynamic data
    const [portfolios, products] = await Promise.all([
        getPortfolios(),
        getDigitalProducts(true)
    ]);

    for (const locale of locales) {
        // 1. Static Routes for this locale
        const staticRoutes = [
            "",
            "/services",
            "/portfolio",
            "/products",
            "/contact",
            "/experts",
            "/price-calculator",
            "/submit-testimonial",
            "/privacy",
            "/terms",
        ].map((route) => ({
            url: `${baseUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: route === "" ? 1 : 0.8,
            languages: {
                id: `${baseUrl}/id${route}`,
                en: `${baseUrl}/en${route}`,
            },
        }));

        // 2. Dynamic Routes: Portfolios for this locale
        const portfolioRoutes = portfolios.map((portfolio) => ({
            url: `${baseUrl}/${locale}/view-design/${portfolio.slug}`,
            lastModified: portfolio.createdAt,
            changeFrequency: "monthly" as const,
            priority: 0.7,
            languages: {
                id: `${baseUrl}/id/view-design/${portfolio.slug}`,
                en: `${baseUrl}/en/view-design/${portfolio.slug}`,
            },
        }));

        // 3. Dynamic Routes: Products for this locale
        const productRoutes = products.map((product) => ({
            url: `${baseUrl}/${locale}/products/${product.slug}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
            languages: {
                id: `${baseUrl}/id/products/${product.slug}`,
                en: `${baseUrl}/en/products/${product.slug}`,
            },
        }));

        allRoutes.push(...staticRoutes, ...portfolioRoutes, ...productRoutes);
    }

    return allRoutes;
}
