"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { fetchRenderedHtml } from "@/lib/server/cloudflare-rendering";

const DATA_DIR = path.join(process.cwd(), "data/portfolios");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");
const HTML_DIR = path.join(DATA_DIR, "html");
const CACHE_DIR = path.join(DATA_DIR, "cache");

export interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    category: string;
    description?: string;
    externalUrl?: string;
    imageUrl?: string;
    createdAt: string;
}

async function ensureDirs() {
    await fs.mkdir(HTML_DIR, { recursive: true });
    await fs.mkdir(CACHE_DIR, { recursive: true });
    try {
        await fs.access(MANIFEST_PATH);
    } catch {
        await fs.writeFile(MANIFEST_PATH, JSON.stringify([]));
    }
}

export async function getPortfolios(): Promise<PortfolioItem[]> {
    await ensureDirs();
    const data = await fs.readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(data);
}

export async function getPortfolioHtml(slug: string): Promise<string> {
    const filePath = path.join(HTML_DIR, `${slug}.html`);
    try {
        return await fs.readFile(filePath, "utf-8");
    } catch {
        return "<h1>File not found</h1>";
    }
}

export async function savePortfolio(item: Omit<PortfolioItem, "id" | "createdAt">, html: string) {
    await ensureDirs();
    const portfolios = await getPortfolios();

    const id = Math.random().toString(36).substring(2, 9);
    const newItem: PortfolioItem = {
        ...item,
        id,
        createdAt: new Date().toISOString(),
    };

    // Save HTML file
    await fs.writeFile(path.join(HTML_DIR, `${newItem.slug}.html`), html);

    // Update manifest
    portfolios.push(newItem);
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(portfolios, null, 2));

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");
    return newItem;
}

export async function deletePortfolio(id: string) {
    await ensureDirs();
    let portfolios = await getPortfolios();
    const item = portfolios.find(p => p.id === id);

    if (item) {
        // Delete HTML file
        try {
            await fs.unlink(path.join(HTML_DIR, `${item.slug}.html`));
        } catch (e) {
            console.error("Failed to delete HTML file", e);
        }

        // Update manifest
        portfolios = portfolios.filter(p => p.id !== id);
        await fs.writeFile(MANIFEST_PATH, JSON.stringify(portfolios, null, 2));
    }

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");
}

// In-memory cache for ultra-fast access
const proxyMap = new Map<string, { html: string; timestamp: number }>();
// Pending promise map to handle parallel requests for the same URL
const pendingRequests = new Map<string, Promise<string>>();
const CACHE_TTL = 60 * 60 * 1000; // 1 Hour

function getCacheKey(url: string) {
    // Basic alphanumeric sanitization for filename
    return Buffer.from(url).toString('base64').replace(/[/+=]/g, '_').substring(0, 100);
}

export async function getRenderedHtml(url: string, localBaseUrl?: string): Promise<string> {
    const cacheKey = getCacheKey(url);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.cache.html`);

    // 1. Memory Cache Hit
    const memoryCached = proxyMap.get(url);
    if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_TTL) {
        return memoryCached.html;
    }

    // 2. Persistent Disk Cache Discovery
    try {
        const stats = await fs.stat(cachePath);
        if (Date.now() - stats.mtimeMs < CACHE_TTL) {
            const html = await fs.readFile(cachePath, "utf-8");
            proxyMap.set(url, { html, timestamp: stats.mtimeMs });
            return html;
        }
    } catch {
        // Disk cache miss or invalid, proceed to fetch
    }

    // 3. Parallel Request Deduplication (Debounce)
    if (pendingRequests.has(url)) {
        console.log(`[ProxyCache] deduplicating parallel request: ${url}`);
        return pendingRequests.get(url)!;
    }

    // 4. Actual Content Fetch
    const fetchPromise = (async () => {
        try {
            const html = await fetchRenderedHtml(url, localBaseUrl);
            
            // Background storage
            await fs.mkdir(CACHE_DIR, { recursive: true });
            await fs.writeFile(cachePath, html);
            proxyMap.set(url, { html, timestamp: Date.now() });

            return html;
        } catch (_error) {
            console.error("[ProxyCache] Fatal Error:", _error);
            return `[Proxy Error] Full render failed.`;
        } finally {
            pendingRequests.delete(url);
        }
    })();

    pendingRequests.set(url, fetchPromise);
    return fetchPromise;
}
