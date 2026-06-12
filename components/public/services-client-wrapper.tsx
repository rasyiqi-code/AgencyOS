"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Button } from "@/components/ui/button";

interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    slug?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency?: string | null;
    interval: string;
    features: unknown;
    category?: string | null;
    features_id?: unknown;
    image: string | null;
}

interface ServicesClientWrapperProps {
    services: Service[];
    pageTitle?: string | null;
    pageSubtitle?: string | null;
}

export function ServicesClientWrapper({ services, pageTitle, pageSubtitle }: ServicesClientWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    const isId = pathname.startsWith("/id") || pathname.includes("/id/");

    // Filter reaktif terhadap daftar layanan berdasarkan input pencarian
    const filteredServices = services.filter((service) => {
        const titleText = (isId ? service.title_id : null) || service.title || "";
        const descText = (isId ? service.description_id : null) || service.description || "";
        return (
            titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            descText.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    useEffect(() => {
        // Handle post-login checkout
        const action = searchParams.get('action');
        if (action === 'checkout') {
            const pendingServiceId = sessionStorage.getItem('pendingServiceCheckout');
            if (pendingServiceId) {
                sessionStorage.removeItem('pendingServiceCheckout');

                // Trigger checkout for the pending service
                const proceedToCheckout = async () => {
                    try {
                        const res = await fetch("/api/estimates", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ serviceId: pendingServiceId })
                        });

                        const data = await res.json();

                        if (!res.ok) {
                            toast.error(data.error || "Failed to create order");
                            return;
                        }

                        if (data.id) {
                            router.push(`/checkout/${data.id}`);
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to proceed to checkout");
                    }
                };

                proceedToCheckout();
            }
        }
    }, [searchParams, router]);

    const st = useTranslations("Services");

    return (
        <div className="relative bg-black overflow-hidden">
            {/* Landing Style Background */}
            <div className="absolute inset-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial Gradient overlay */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand-yellow/10 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-8 sm:py-24 relative z-10">
                <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-[10px] sm:text-sm text-zinc-500 hover:text-white mb-4 sm:mb-6 transition-colors gap-1">
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        {st("backToHome")}
                    </Link>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-brand-yellow" />
                        {pageTitle || st("title")}
                    </h1>
                    <p className="text-sm sm:text-lg text-zinc-400 leading-relaxed px-4 sm:px-0">
                        {pageSubtitle || st("subtitle")}
                    </p>
                </div>

                {/* Bilah Pencarian Jasa Premium */}
                <div className="mb-10 max-w-md mx-auto relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder={isId ? "Cari jasa yang tersedia..." : "Search available services..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 focus:bg-zinc-900/80 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-yellow/80 focus:ring-1 focus:ring-brand-yellow/30 text-sm transition-all shadow-lg shadow-black/40"
                        />
                    </div>
                </div>

                {/* Petunjuk pencarian saat input masih kosong */}
                {searchQuery === "" && (
                    <div className="max-w-md mx-auto text-center py-16 animate-in fade-in duration-700">
                        <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-500 shadow-inner">
                            <Search className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-zinc-400">
                            {isId ? "Ketik nama layanan atau kategori untuk mulai mencari." : "Type a service name or category to start searching."}
                        </p>
                    </div>
                )}

                {/* Hasil Pencarian List Premium */}
                {searchQuery.length > 0 && filteredServices.length > 0 && (
                    <div className="max-w-3xl mx-auto divide-y divide-white/5 border border-white/10 rounded-2xl bg-zinc-900/25 backdrop-blur-md overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        {filteredServices.map((service) => {
                            const titleText = (isId ? service.title_id : null) || service.title || "";
                            const descText = (isId ? service.description_id : null) || service.description || "";

                            return (
                                <div
                                    key={service.id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold text-brand-yellow uppercase tracking-wider">
                                                {service.category || "General"}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                {service.interval === 'one_time' ? "One-time" : service.interval}
                                            </span>
                                        </div>
                                        <Link href={`/services/${service.slug || service.id}`}>
                                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight truncate">
                                                {titleText}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 max-w-xl">
                                            {descText}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                        <div className="text-right">
                                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Mulai Dari</div>
                                            <div className="text-base sm:text-lg font-black text-white tracking-tight">
                                                <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/services/${service.slug || service.id}`}>
                                                <Button size="sm" variant="ghost" className="h-9 text-xs text-zinc-400 hover:text-white hover:bg-white/5 font-semibold">
                                                    Detail
                                                </Button>
                                            </Link>
                                            <PurchaseButton
                                                serviceId={service.id}
                                                interval={service.interval}
                                                className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-9 px-4 rounded-xl text-xs uppercase tracking-tight shadow-md shadow-brand-yellow/15"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {services.length > 0 && searchQuery.length > 0 && filteredServices.length === 0 && (
                    <div className="max-w-md mx-auto text-center py-16 bg-zinc-900/10 border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/10 animate-in fade-in duration-300">
                        <p className="text-zinc-500 text-sm font-medium">{isId ? "Tidak ada layanan yang cocok dengan pencarian Anda." : "No services match your search query."}</p>
                        <p className="text-zinc-600 text-xs mt-1">{isId ? "Silakan coba kata kunci lain." : "Please try different keywords."}</p>
                    </div>
                )}

                {services.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 max-w-7xl mx-auto">
                        <p className="text-zinc-500 text-lg">{st("noServices") || "No services available publicly at the moment."}</p>
                        <p className="text-zinc-600 text-sm mt-2">{st("checkBack") || "Check back soon for updates."}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
