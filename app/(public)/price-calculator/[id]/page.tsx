import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { EstimateViewer } from "@/components/estimate/estimate-viewer";

async function getEstimate(id: string) {
    const estimate = await prisma.estimate.findUnique({
        where: { id }
    });
    return estimate;
}

export default async function EstimateResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const estimate = await getEstimate(id);

    if (!estimate) {
        notFound();
    }

    // Convert Prisma Json to specific types for the component props
    const sanitizedEstimate = {
        ...estimate,
        screens: (estimate.screens as unknown as { title: string, hours: number, description?: string }[] || []).map((s: { title: string, hours: number, description?: string }) => ({ ...s, description: s.description || "" })),
        apis: (estimate.apis as unknown as { title: string, hours: number, description?: string }[] || []).map((a: { title: string, hours: number, description?: string }) => ({ ...a, description: a.description || "" }))
    };

    return (
        <main className="min-h-screen bg-black selection:bg-lime-500/30 pb-24">
            <SiteHeader />
            <div className="container mx-auto px-4 py-24">
                <EstimateViewer estimate={sanitizedEstimate} />
            </div>
        </main>
    );
}
