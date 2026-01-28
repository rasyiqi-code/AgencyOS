// import { deleteService } from "@/app/actions/admin";
import { DeleteServiceButton } from "@/components/admin/services/delete-service-button";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ServicesPage() {
    // Strict Access Control: Only Admins can manage services
    if (!await isAdmin()) redirect('/dashboard');

    const services = await prisma.service.findMany({
        orderBy: { createdAt: 'desc' }
    });



    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Package className="w-8 h-8 text-blue-500" />
                        Service Catalog
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm">
                        Manage productized services and subscription plans.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/pm/services/new">
                        <Button className="bg-white text-black hover:bg-zinc-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Service
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-500">No services defined yet.</p>
                    </div>
                )}

                {services.map((service) => (
                    <div key={service.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 p-6 transition-all hover:border-blue-500/50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                {service.image && (
                                    <div className="mb-4 rounded-lg overflow-hidden border border-white/5 aspect-video w-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                                <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mt-1">
                                    {service.interval === 'one_time' ? 'One Time Fee' : service.interval}
                                </div>
                            </div>
                            <div className="text-xl font-bold text-white">
                                ${service.price}
                            </div>
                        </div>

                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{service.description.replace(/<[^>]*>?/gm, '')}</p>

                        <div className="mb-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider bg-black/20 p-2 rounded border border-white/5">
                            <span className="text-zinc-600">Creem ID:</span>
                            <span className={service.creemProductId ? "text-zinc-400" : "text-amber-500 font-bold"}>
                                {service.creemProductId || "Not Synced"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-auto">
                            <Link href={`/admin/pm/services/${service.id}/edit`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white">
                                    <Edit className="w-3.5 h-3.5 mr-2" />
                                    Edit
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
