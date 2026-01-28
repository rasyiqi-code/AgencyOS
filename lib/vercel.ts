
import { prisma } from "./db";
import type { PrismaWithIntegration } from "@/types/payment";

export interface VercelDeployment {
    uid: string;
    name: string;
    url: string;
    state: 'BUILDING' | 'READY' | 'ERROR' | 'QUEUED' | 'CANCELED';
    createdAt: number;
}

async function getVercelToken() {
    try {
        const integration = await (prisma as unknown as PrismaWithIntegration).systemIntegration.findUnique({
            where: { provider: "vercel", isActive: true }
        });
        return integration?.accessToken || process.env.VERCEL_ACCESS_TOKEN;
    } catch (error) {
        console.error("Error fetching Vercel token from DB:", error);
        return process.env.VERCEL_ACCESS_TOKEN;
    }
}

export async function getLatestDeployment(deployUrl: string): Promise<VercelDeployment | null> {
    const token = await getVercelToken();
    if (!token) return null;

    try {
        // 1. Extract the project name/slug from the deployUrl
        // Example deployUrl: https://agency-os.vercel.app or agency-os
        const projectHost = deployUrl.replace('https://', '').replace('http://', '').split('/')[0];
        const projectName = projectHost.replace('.vercel.app', '');

        // 2. Fetch deployments for this specific host
        const res = await fetch(`https://api.vercel.com/v6/deployments?limit=1&app=${projectName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            // Fallback: list all deployments if filtered fetch fails
            const fallbackRes = await fetch(`https://api.vercel.com/v6/deployments?limit=1`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!fallbackRes.ok) return null;
            const fallbackData = await fallbackRes.json();
            return fallbackData.deployments?.[0] || null;
        }

        const data = await res.json();
        return data.deployments?.[0] || null;
    } catch (error) {
        console.error("Error fetching Vercel deployment:", error);
        return null;
    }
}

export async function getProjectDomains(projectName: string) {
    const token = await getVercelToken();
    if (!token) return [];

    try {
        const res = await fetch(`https://api.vercel.com/v9/projects/${projectName}/domains`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return data.domains || [];
    } catch (error) {
        console.error("Error fetching Vercel domains:", error);
        return [];
    }
}
