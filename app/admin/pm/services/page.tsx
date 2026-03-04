// import { deleteService } from "@/app/actions/admin";
import { DeleteServiceButton } from "@/components/admin/services/delete-service-button";
import { PriceDisplay } from "@/components/providers/currency-provider";
import Image from "next/image";
import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px]">{isId ? 'Manajemen' : 'Management'}</Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        {isId ? 'Katalog Layanan' : 'Service Catalog'}
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-1.5 text-xs sm:text-sm max-w-lg">
                        {isId ? 'Kelola layanan terproduk dan paket berlangganan.' : 'Manage productized services and subscription plans.'}
                    </p>
                </div>
                <Link href="/admin/pm/services/new" className="shrink-0">
                    <Button className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 h-9 text-xs font-bold">
                        <Plus className="w-4 h-4 mr-1.5" />
                        {isId ? 'Buat Layanan' : 'Create Service'}
                    </Button>
                </Link>
            </div>

            <div className="w-full space-y-2">
                {services.length === 0 && (
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                        {isId ? 'Belum ada layanan.' : 'No services defined yet.'}
                    </div>
                )}

                <Accordion type="multiple" className="w-full space-y-2">
                    {services.map((service) => {
                        const intervalLabel = service.interval === 'one_time'
                            ? (isId ? 'Sekali Bayar' : 'One Time')
                            : (isId ? (service.interval === 'monthly' ? 'Bulanan' : 'Tahunan') : service.interval);
                        const displayTitle = isId ? (service.title_id || service.title) : service.title;
                        const displayDesc = (isId ? (service.description_id || service.description) : service.description).replace(/<[^>]*>?/gm, '');
                        const isSynced = !!service.creemProductId;

                        return (
                            <AccordionItem
                                value={service.id}
                                key={service.id}
                                className="border border-zinc-800/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/80 bg-zinc-950/50 data-[state=open]:border-zinc-700/80"
                            >
                                <AccordionTrigger className="hover:no-underline px-4 py-3.5 cursor-pointer hover:bg-zinc-900/40 group">
                                    <div className="flex w-full flex-1 items-center gap-3 overflow-hidden">
                                        {/* Status indicator dot — green if synced, amber if not */}
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${isSynced ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                                        {/* Title + interval badge */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white text-sm truncate">{displayTitle}</span>
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-normal py-0 px-1.5 h-4 text-[9px] shrink-0 uppercase tracking-wider">
                                                    {intervalLabel}
                                                </Badge>
                                            </div>
                                            <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
                                                <PriceDisplay amount={service.price} baseCurrency={((service as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} />
                                            </span>
                                        </div>

                                        {/* Creem sync status badge + date */}
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <Badge
                                                variant="outline"
                                                className={`py-0 px-2 h-5 text-[10px] ${isSynced
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}
                                            >
                                                {isSynced ? 'Synced' : (isId ? 'Belum Sinkron' : 'Not Synced')}
                                            </Badge>
                                            <span className="text-zinc-600 text-[11px] whitespace-nowrap">
                                                {new Date(service.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-1 border-t border-zinc-800/40">
                                    <div className="flex flex-col md:flex-row gap-6 mt-3">
                                        {/* Service Image */}
                                        {service.image && (
                                            <div className="relative rounded-lg overflow-hidden border border-white/5 w-full md:w-40 aspect-square shrink-0 bg-black/30">
                                                <Image
                                                    src={service.image}
                                                    alt={displayTitle}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 flex flex-col min-w-0">
                                            {/* Description */}
                                            {displayDesc && (
                                                <p className="text-zinc-400 text-xs leading-relaxed mb-3 max-w-2xl">
                                                    {displayDesc}
                                                </p>
                                            )}

                                            {/* Detail grid — matching projects style */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                                <div className="flex items-center gap-2 group/detail">
                                                    <span className="text-zinc-600"><Package className="w-3.5 h-3.5" /></span>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">Creem ID</span>
                                                        <span className={`text-xs font-mono truncate block ${isSynced ? 'text-zinc-400' : 'text-amber-500 italic'}`} title={service.creemProductId || undefined}>
                                                            {service.creemProductId || (isId ? 'Belum Sinkron' : 'Not Synced')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2 justify-end pt-1">
                                                <Link href={`/admin/pm/services/${service.id}/edit`}>
                                                    <Button variant="outline" size="sm" className="h-8 px-4 text-xs border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-400 gap-2">
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <DeleteServiceButton serviceId={service.id} />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        </div>
    );
}
