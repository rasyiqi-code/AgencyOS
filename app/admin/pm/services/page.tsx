// import { deleteService } from "@/app/actions/admin";
import { DeleteServiceButton } from "@/components/admin/services/delete-service-button";
import { PriceDisplay } from "@/components/providers/currency-provider";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-500">{isId ? 'Belum ada layanan.' : 'No services defined yet.'}</p>
                    </div>
                )}

                {services.map((service) => (
                    <div key={service.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 p-6 transition-all hover:border-blue-500/50">
                        {service.image && (
                            <div className="relative mb-4 rounded-lg overflow-hidden border border-white/5 aspect-square w-full">
                                <Image
                                    src={service.image}
                                    alt={isId ? (service.title_id || service.title) : service.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-white mb-3 line-clamp-1">{isId ? (service.title_id || service.title) : service.title}</h3>
                            <div className="flex items-center justify-between">
                                <div className="text-xl font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                                    <PriceDisplay amount={service.price} baseCurrency={((service as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} />
                                </div>
                                <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded">
                                    {service.interval === 'one_time' ? (isId ? 'Sekali Bayar' : 'One Time') : (isId ? (service.interval === 'monthly' ? 'Bulanan' : 'Tahunan') : service.interval)}
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{(isId ? (service.description_id || service.description) : service.description).replace(/<[^>]*>?/gm, '')}</p>

                        <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider bg-black/20 p-2 rounded border border-white/5">
                            <span className="text-zinc-600">Creem ID:</span>
                            <span className={service.creemProductId ? "text-zinc-400" : "text-amber-500 font-bold"}>
                                {service.creemProductId || (isId ? "Belum Sinkron" : "Not Synced")}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-auto">
                            <Link href={`/admin/pm/services/${service.id}/edit`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white">
                                    <Edit className="w-3.5 h-3.5 mr-2" />
                                    {isId ? 'Edit' : 'Edit'}
                                </Button>
                            </Link>
                            <DeleteServiceButton serviceId={service.id} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
