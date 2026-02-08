import { prisma } from "@/lib/config/db";
import { Sparkles } from "lucide-react";
import { ServiceCard } from "@/components/dashboard/services/service-card";
import { Service as DashboardService } from "@/components/dashboard/services/service-modal-content";
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

    // Transform to match ServiceCard interface
    const processedServices = services.map((s: Service) => ({
        ...s,
        features: s.features as unknown,
        features_id: s.features_id as unknown
    }));

    return (
        <div className="w-full py-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-brand-yellow" />
                    {isId ? 'Layanan Kami' : 'Our Services'}
                </h1>
                <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
                    {isId ? 'Pilih paket layanan kelas enterprise yang dikurasi untuk mempercepat pertumbuhan bisnis Anda.' : 'Choose from our curated enterprise-grade services to accelerate your business growth.'}
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
                {processedServices.map((service) => (
                    <ServiceCard key={service.id} service={service as DashboardService} />
                ))}

                {processedServices.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
                        <p className="text-zinc-500 text-lg">{isId ? 'Belum ada layanan tersedia saat ini.' : 'No services available at the moment.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
