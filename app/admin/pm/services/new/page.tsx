
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/shared/auth-helpers";
// import { createService } from "@/app/actions/admin";
// import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
// import { ServiceImageUpload } from "@/components/admin/services/image-image-upload";
// import { SubmitButton } from "@/components/admin/submit-button";
import { CreateServiceForm } from "@/components/admin/services/create-service-form";

export default async function NewServicePage() {
    if (!await isAdmin()) redirect('/dashboard');

    return (
        <div className="w-full py-6">
            <CreateServiceForm />
        </div>
    );
}
