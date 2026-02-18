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
    }));

    // 2. Dynamic Routes: Portfolios
    const portfolios = await getPortfolios();
    const portfolioRoutes = portfolios.map((portfolio) => ({
        url: `${baseUrl}/view-design/${portfolio.slug}`,
        lastModified: portfolio.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // 3. Dynamic Routes: Products
    const products = await getDigitalProducts(true);
    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
    }));

    return [...staticRoutes, ...portfolioRoutes, ...productRoutes];
}
