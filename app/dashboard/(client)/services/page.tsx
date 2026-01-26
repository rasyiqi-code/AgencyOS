
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { createServiceOrder } from "@/app/actions/store";
import { PriceDisplay } from "@/components/providers/currency-provider";

export default async function ClientServicesPage() {
    const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    return (
        <div className="w-full py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                    Service Store
                </h1>
                <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
                    Instantly add capabilities to your project. Select a service below to get started immediately.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((service) => (
                    <div key={service.id} className="relative flex flex-col rounded-2xl border border-white/10 bg-zinc-900/40 p-6 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-900/10">
                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-white">{service.title}</h3>
                            <p className="text-sm text-zinc-400 mt-2 min-h-[40px]">{service.description.replace(/<[^>]*>?/gm, '')}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-6 pb-6 border-b border-white/5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">
                                    <PriceDisplay amount={service.price} />
                                </span>
                                <span className="text-sm text-zinc-500 uppercase font-medium">
                                    / {service.interval === 'one_time' ? 'once' : service.interval}
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="flex-1 space-y-3 mb-8">
                            {(service.features as string[]).map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="leading-tight">{feature.replace(/<[^>]*>?/gm, '')}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Action */}
                        <form action={async () => {
                            "use server";
                            await createServiceOrder(service.id);
                        }}>
                            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-11">
                                Purchase {service.interval === 'one_time' ? 'Package' : 'Plan'}
                            </Button>
                        </form>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full text-center py-20 text-zinc-500">
                        No services available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}
