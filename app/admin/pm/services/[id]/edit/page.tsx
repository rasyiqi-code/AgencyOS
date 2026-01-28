import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { isAdmin } from "@/lib/auth-helpers";
// import { updateService } from "@/app/actions/admin";
// import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
// import { ServiceImageUpload } from "@/components/admin/services/image-upload";
// import { SubmitButton } from "@/components/admin/submit-button";
import { EditServiceForm } from "@/components/admin/services/edit-service-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) redirect('/dashboard');

    const { id } = await params;
    const service = await prisma.service.findUnique({
        where: { id }
    });

    if (!service) notFound();

    // Transform features JSON to string for editor
    const featuresContent = Array.isArray(service.features)
        ? (service.features as string[]).map(f => `< li > ${f}</li > `).join('')
        : '';
    const featuresHtml = `< ul > ${featuresContent}</ul > `;

    return (
        <div className="w-full py-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Service Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        Edit Service
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
                        Update service details, pricing, and features.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/pm/services">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Form Container */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <EditServiceForm service={service as unknown as any} featuresHtml={featuresHtml} />
        </div>
    );
}
