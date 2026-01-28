
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLatestDeployment, getProjectDomains } from "@/lib/vercel";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { deployUrl: true }
    });

    if (!project || !project.deployUrl) {
        return NextResponse.json({ error: "No deploy URL" }, { status: 404 });
    }

    const deployment = await getLatestDeployment(project.deployUrl);

    // Also fetch domains if we have a deployment or project name
    let domains = [];
    try {
        const projectHost = project.deployUrl.replace('https://', '').replace('http://', '').split('/')[0];
        const projectName = projectHost.replace('.vercel.app', '');
        domains = await getProjectDomains(projectName);
    } catch (e) {
        console.error("Error fetching domains for API:", e);
    }

    return NextResponse.json({
        ...deployment,
        domains
    });
}
