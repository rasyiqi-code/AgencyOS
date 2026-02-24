// import { deleteService } from "@/app/actions/admin";
import { DeleteServiceButton } from "@/components/admin/services/delete-service-button";
import { PriceDisplay } from "@/components/providers/currency-provider";
import Image from "next/image";
import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default async function ServicesPage() {
    // Strict Access Control: Only Admins can manage services
    if (!await isAdmin()) redirect('/dashboard');

    const services = await prisma.service.findMany({
        orderBy: { createdAt: 'desc' }
    });



    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Package className="w-8 h-8 text-blue-500" />
                        {isId ? 'Katalog Layanan' : 'Service Catalog'}
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm">
                        {isId ? 'Kelola layanan terproduk dan paket berlangganan.' : 'Manage productized services and subscription plans.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/pm/services/new">
                        <Button className="bg-white text-black hover:bg-zinc-200">
                            <Plus className="w-4 h-4 mr-2" />
                            {isId ? 'Buat Layanan' : 'Create Service'}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="w-full">
                {services.length === 0 && (
                    <div className="w-full py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-500">{isId ? 'Belum ada layanan.' : 'No services defined yet.'}</p>
                    </div>
                )}

                <Accordion type="multiple" className="w-full space-y-3">
                    {services.map((service) => (
                        <AccordionItem value={service.id} key={service.id} className="border border-white/10 bg-zinc-900/40 rounded-xl px-4 data-[state=open]:border-blue-500/50 transition-all overflow-hidden content-center">
                            <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
                                <div className="flex flex-col sm:flex-row w-full flex-1 items-start sm:items-center justify-between gap-2 sm:gap-4 pr-2 sm:pr-4 overflow-hidden">
                                    <div className="flex items-center gap-4 text-left w-full sm:flex-1 shrink-0 overflow-hidden">
                                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">{isId ? (service.title_id || service.title) : service.title}</h3>
                                    </div>
                                    <div className="flex items-center justify-start sm:justify-end gap-3 w-full sm:w-auto shrink-0 flex-none transition-opacity">
                                        <div className="text-[10px] sm:text-xs font-medium text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                                            {service.interval === 'one_time' ? (isId ? 'Sekali Bayar' : 'One Time') : (isId ? (service.interval === 'monthly' ? 'Bulanan' : 'Tahunan') : service.interval)}
                                        </div>
                                        <div className="text-sm sm:text-lg font-bold text-white bg-white/10 px-2 flex items-center justify-center py-0.5 sm:py-1 rounded-lg min-w-max">
                                            <PriceDisplay amount={service.price} baseCurrency={((service as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} />
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6 border-t border-white/5">
                                <div className="flex flex-col md:flex-row gap-6 mt-4">
                                    {service.image && (
                                        <div className="relative rounded-lg overflow-hidden border border-white/5 w-full md:w-48 aspect-square shrink-0">
                                            <Image
                                                src={service.image}
                                                alt={isId ? (service.title_id || service.title) : service.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col">
                                        <p className="text-sm text-zinc-400 mb-6 flex-1">
                                            {(isId ? (service.description_id || service.description) : service.description).replace(/<[^>]*>?/gm, '')}
                                        </p>

                                        <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider bg-black/20 p-2 rounded border border-white/5 w-fit">
                                            <span className="text-zinc-600">Creem ID:</span>
                                            <span className={service.creemProductId ? "text-zinc-400" : "text-amber-500 font-bold"}>
                                                {service.creemProductId || (isId ? "Belum Sinkron" : "Not Synced")}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-auto">
                                            <Link href={`/admin/pm/services/${service.id}/edit`}>
                                                <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800 hover:text-white">
                                                    <Edit className="w-3.5 h-3.5 mr-2" />
                                                    {isId ? 'Edit' : 'Edit'}
                                                </Button>
                                            </Link>
                                            <DeleteServiceButton serviceId={service.id} />
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
