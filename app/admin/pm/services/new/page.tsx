import { prisma } from "@/lib/config/db";
import { CreateServiceForm } from "@/components/admin/services/create-service-form";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/shared/auth-helpers";

export default async function NewServicePage() {
    if (!await isAdmin()) redirect('/dashboard');

    const services = await prisma.service.findMany({
        select: { category: true },
        distinct: ['category']
    });

    const categories = Array.from(new Set(
        services
            .map(s => s.category)
            .filter((c): c is string => !!c && c !== 'Uncategorized')
    )).sort();

    return (
        <div className="w-full py-6">
            <CreateServiceForm categories={categories} />
        </div>
    );
}
