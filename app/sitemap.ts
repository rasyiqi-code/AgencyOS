import { getDigitalProducts } from "@/app/actions/digital-products";
import { getPortfolios } from "@/lib/portfolios/actions";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Static Routes
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
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
        languages: {
            id: `${baseUrl}${route}`,
            en: `${baseUrl}${route}`,
        },
    }));

    // 2. Dynamic Routes: Portfolios
    let portfolioRoutes: MetadataRoute.Sitemap = [];
    try {
        const portfolios = await getPortfolios();
        portfolioRoutes = portfolios.map((portfolio) => ({
            url: `${baseUrl}/view-design/${portfolio.slug}`,
            lastModified: portfolio.createdAt,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Failed to fetch portfolios for sitemap:", error);
    }

    // 3. Dynamic Routes: Products
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const products = await getDigitalProducts(true);
        productRoutes = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));
    } catch (error) {
        console.error("Failed to fetch products for sitemap:", error);
    }

    return [...staticRoutes, ...portfolioRoutes, ...productRoutes];
}
