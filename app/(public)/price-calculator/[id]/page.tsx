import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { EstimateViewer } from "@/components/estimate/estimate-viewer";
import { getCurrentUser } from "@/lib/auth-helpers";
import Link from "next/link";

import { Estimate } from "@prisma/client";

async function getEstimate(id: string) {
    const estimate = await prisma.estimate.findUnique({
        where: { id }
    });
    return estimate as Estimate | null;
}

export default async function EstimateResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const estimate = await getEstimate(id);

    if (!estimate) {
        notFound();
    }

    // Access Control
    if (estimate.userId) {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.id !== estimate.userId) {
            // If logged in but wrong user, or not logged in at all for a private estimate
            return (
                <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-zinc-400 mb-6">You do not have permission to view this estimate.</p>
                    <Link href="/price-calculator" className="text-brand-yellow hover:underline">Create your own estimate</Link>
                </main>
            );
        }
    }

    // Convert Prisma Json to specific types for the component props
    const sanitizedEstimate = {
        ...estimate,
        screens: (estimate.screens as unknown as { title: string, hours: number, description?: string }[] || []).map((s: { title: string, hours: number, description?: string }) => ({ ...s, description: s.description || "" })),
        apis: (estimate.apis as unknown as { title: string, hours: number, description?: string }[] || []).map((a: { title: string, hours: number, description?: string }) => ({ ...a, description: a.description || "" }))
    };

    return (
        <main className="min-h-screen bg-black selection:bg-blue-500/30 pb-24">
            <SiteHeader />
            <div className="container mx-auto px-4 py-24">
                <EstimateViewer estimate={sanitizedEstimate} />
            </div>
        </main>
    );
}
