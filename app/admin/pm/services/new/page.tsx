import { CreateServiceForm } from "@/components/admin/services/create-service-form";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/shared/auth-helpers";

export default async function NewServicePage() {
    if (!await isAdmin()) redirect('/dashboard');

    return (
        <div className="w-full py-6">
            <CreateServiceForm />
        </div>
    );
}
