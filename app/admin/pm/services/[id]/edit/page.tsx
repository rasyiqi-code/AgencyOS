import { prisma } from "@/lib/config/db";
import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { EditServiceForm, type ServiceData } from "@/components/admin/services/edit-service-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) redirect('/dashboard');

    const { id } = await params;

    const service = await prisma.service.findUnique({
        where: { id }
    });

    if (!service) notFound();

    const features = Array.isArray(service.features) ? service.features as string[] : [];
    const features_id = Array.isArray((service as unknown as Record<string, unknown>).features_id) ? (service as unknown as Record<string, unknown>).features_id as string[] : [];

    return (
        <div className="w-full py-6">
            <EditServiceForm
                service={service as unknown as ServiceData}
                features={features}
                features_id={features_id}
            />
        </div>
    );
}
