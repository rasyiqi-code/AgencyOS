import { prisma } from "@/lib/config/db";
import { WebhookSimulator } from "@/components/admin/system/webhooks/simulator-client";
import { Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WebhookSimulatorPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            slug: true,
            externalWebhookUrl: true,
        }
    });

    return (
        <div className="w-full py-1 md:py-4 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-brand-yellow" />
                        Webhook Simulator
                    </h1>
                    <p className="text-zinc-400 mt-1.5 text-sm">
                        Test your SaaS integrations by simulating outgoing events.
                    </p>
                </div>
            </div>

            <WebhookSimulator products={products as Array<{ id: string; name: string; slug: string; externalWebhookUrl: string | null }>} />
        </div>
    );
}
