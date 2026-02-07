
import { prisma } from "@/lib/config/db";
import { Check, Sparkles } from "lucide-react";
// import { createServiceOrder } from "@/app/actions/store";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay } from "@/components/providers/currency-provider";

import { cookies } from "next/headers";

export default async function ClientServicesPage() {
    const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    return (
        <div className="w-full py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                    {isId ? 'Toko Layanan' : 'Service Store'}
                </h1>
                <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
                    {isId ? 'Tambahkan kemampuan instan ke proyek Anda. Pilih layanan di bawah ini untuk memulai segera.' : 'Instantly add capabilities to your project. Select a service below to get started immediately.'}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((service) => (
                    <div key={service.id} className="relative flex flex-col rounded-2xl border border-white/10 bg-zinc-900/40 p-5 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-900/10">
                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white">{isId ? (service.title_id || service.title) : service.title}</h3>
                            <p className="text-sm text-zinc-400 mt-2 min-h-[40px] leading-relaxed">{(isId ? (service.description_id || service.description) : service.description).replace(/<[^>]*>?/gm, '')}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-5 pb-5 border-b border-white/5">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} />
                                </span>
                                <span className="text-xs text-zinc-500 uppercase font-medium">
                                    / {service.interval === 'one_time' ? (isId ? 'sekali' : 'once') : (isId ? (service.interval === 'monthly' ? 'bulan' : 'tahun') : service.interval)}
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="flex-1 space-y-2.5 mb-6">
                            {((isId && service.features_id) ? (service.features_id as string[]) : (service.features as string[])).map((feature, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="leading-snug text-zinc-300/90">{feature.replace(/<[^>]*>?/gm, '')}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Action */}
                        {/* Action */}
                        <div className="mt-auto">
                            <PurchaseButton
                                serviceId={service.id}
                                interval={service.interval}
                                className="h-10 font-semibold"
                            />
                        </div>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full text-center py-20 text-zinc-500">
                        {isId ? 'Belum ada layanan tersedia saat ini.' : 'No services available at the moment.'}
                    </div>
                )}
            </div>
        </div>
    );
}
