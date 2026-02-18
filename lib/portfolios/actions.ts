"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "data/portfolios");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");
const HTML_DIR = path.join(DATA_DIR, "html");

export interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    category: string;
    description?: string;
    createdAt: string;
}

async function ensureDirs() {
    await fs.mkdir(HTML_DIR, { recursive: true });
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
