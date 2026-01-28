
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { isAdmin } from "@/lib/auth-helpers";
// import { createService } from "@/app/actions/admin";
// import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
// import { ServiceImageUpload } from "@/components/admin/services/image-upload";
// import { SubmitButton } from "@/components/admin/submit-button";
import { CreateServiceForm } from "@/components/admin/services/create-service-form";

export default async function NewServicePage() {
    if (!await isAdmin()) redirect('/dashboard');

    return (
        <div className="w-full py-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Service Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="w-6 h-6 text-blue-500" />
                        Create New Service
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
                        Design a new service offering. Set the pricing model, deliverables, and features.
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

            {/* Main Form Container - Full Width Business Card Style */}
            <CreateServiceForm />
        </div>
    );
}
