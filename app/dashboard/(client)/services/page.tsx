import { prisma } from "@/lib/config/db";
import { ServiceListItem, type Service as DashboardService } from "@/components/dashboard/services/service-list-item";
import { cookies } from "next/headers";
import { Service } from "@prisma/client";

export default async function ClientServicesPage() {
    const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
    });

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    // Transform to match ServiceListItem interface
    const processedServices = services.map((s: Service) => ({
        ...s,
        features: s.features as unknown,
        features_id: s.features_id as unknown
    }));

    return (
        <div className="w-full py-6">
            <div className="flex flex-col gap-4 max-w-5xl">
                {processedServices.map((service) => (
                    <ServiceListItem key={service.id} service={service as DashboardService} />
                ))}

                {processedServices.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-none border-b border-white/5">
                        <p className="text-zinc-500 text-lg">{isId ? 'Belum ada layanan tersedia saat ini.' : 'No services available at the moment.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
