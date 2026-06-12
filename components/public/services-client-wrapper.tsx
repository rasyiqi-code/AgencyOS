"use client";

import { useEffect, useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { SuggestedTags } from "./services/suggested-tags";
import { ServiceListItem } from "./services/service-list-item";

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
}

const potentialTags = [
    { en: "Landing Page", id: "Landing Page" },
    { en: "Website", id: "Website" },
    { en: "Mobile App", id: "Aplikasi Mobile" },
    { en: "SaaS", id: "SaaS" },
    { en: "UI/UX Design", id: "Desain UI/UX" },
    { en: "SEO", id: "SEO" },
    { en: "Maintenance", id: "Maintenance" },
    { en: "E-Commerce", id: "E-Commerce" },
    { en: "Branding", id: "Branding" },
    { en: "Marketing", id: "Pemasaran" }
];

export function ServicesClientWrapper({ services, pageTitle }: ServicesClientWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    const isId = pathname.startsWith("/id") || pathname.includes("/id/");

    // Hitung tag yang aktif berdasarkan kecocokan konten (judul, deskripsi, fitur, kategori)
    const activeTags = potentialTags.filter((tag) => {
        return services.some((service) => {
            const titleText = `${service.title} ${service.title_id || ""}`.toLowerCase();
            const descText = `${service.description} ${service.description_id || ""}`.toLowerCase();
            const categoryText = (service.category || "").toLowerCase();

            // Normalisasi list fitur agar aman saat diakses
            const featuresArray = Array.isArray(service.features)
                ? service.features
                : typeof service.features === "string"
                ? [service.features]
                : [];
            const featuresIdArray = Array.isArray(service.features_id)
                ? service.features_id
                : typeof service.features_id === "string"
                ? [service.features_id]
                : [];

            const featuresText = [...featuresArray, ...featuresIdArray].join(" ").toLowerCase();
            const combinedText = `${titleText} ${descText} ${featuresText} ${categoryText}`;

            return (
                combinedText.includes(tag.en.toLowerCase()) ||
                combinedText.includes(tag.id.toLowerCase())
            );
        });
    }).map((tag) => (isId ? tag.id : tag.en));

    // Gunakan fallback jika tidak ada tag yang cocok sama sekali
    const finalTags = activeTags.length > 0
        ? activeTags
        : potentialTags.map((tag) => (isId ? tag.id : tag.en));

    const displayedTags = finalTags.slice(0, 7);

    // Filter reaktif terhadap daftar layanan berdasarkan input pencarian
    const filteredServices = services.filter((service) => {
        const titleText = (isId ? service.title_id : null) || service.title || "";
        const descText = (isId ? service.description_id : null) || service.description || "";
        return (
            titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            descText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (service.category || "").toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="relative bg-black overflow-hidden min-h-[70vh]">
            {/* Landing Style Background */}
            <div className="absolute inset-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                {/* Radial Gradient overlay */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[600px] rounded-full bg-brand-yellow/5 blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
                <div className="mb-10 text-center max-w-3xl mx-auto flex flex-col items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-yellow animate-pulse mb-3" />
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-tight">
                        {pageTitle || st("title")}
                    </h1>
                </div>

                {/* Bilah Pencarian Jasa Premium */}
                <div className="mb-12 max-w-xl mx-auto relative animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-yellow/30 to-brand-yellow/10 rounded-none blur opacity-30 group-focus-within:opacity-100 group-hover:opacity-50 transition duration-1000 group-focus-within:duration-200" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-zinc-500 group-focus-within:text-brand-yellow transition-colors" />
                            <input
                                type="text"
                                placeholder={isId ? "Cari jasa yang Anda butuhkan..." : "Search services you need..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-950/80 hover:bg-zinc-950/95 focus:bg-black border-b border-white/10 focus:border-brand-yellow/50 rounded-none py-4 pl-12 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-yellow/20 text-sm sm:text-base transition-all shadow-xl shadow-black/80"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                                >
                                    {isId ? "Hapus" : "Clear"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pintasan Saran Pencarian */}
                    {searchQuery === "" && (
                        <SuggestedTags 
                            onTagClick={(tag) => setSearchQuery(tag)} 
                            isId={isId} 
                            servicesCount={services.length} 
                            tags={displayedTags}
                        />
                    )}
                </div>

                {/* Hasil Pencarian List Premium */}
                {searchQuery.length > 0 && filteredServices.length > 0 && (
                    <div className="max-w-4xl mx-auto bg-zinc-950/30 backdrop-blur-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-3 duration-500 divide-y divide-white/5">
                        {filteredServices.map((service) => (
                            <ServiceListItem key={service.id} service={service} isId={isId} />
                        ))}
                    </div>
                )}

                {/* State Kosong (Tidak ada hasil cocok) */}
                {searchQuery.length > 0 && filteredServices.length === 0 && (
                    <div className="max-w-md mx-auto text-center py-16 bg-zinc-950/20 border-b border-white/5 rounded-none p-6 shadow-xl animate-in fade-in duration-300">
                        <p className="text-zinc-400 text-sm font-semibold">
                            {isId ? "Tidak ada layanan yang cocok dengan pencarian Anda." : "No services match your search query."}
                        </p>
                        <p className="text-zinc-600 text-xs mt-1">
                            {isId ? "Silakan coba dengan kata kunci lain." : "Please try using different keywords."}
                        </p>
                    </div>
                )}

                {/* Jika database kosong secara keseluruhan */}
                {services.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-zinc-950/30 rounded-none border-b border-white/5 max-w-4xl mx-auto">
                        <p className="text-zinc-500 text-lg font-medium">
                            {isId ? "Belum ada layanan publik yang tersedia saat ini." : "No services available publicly at the moment."}
                        </p>
                        <p className="text-zinc-600 text-sm mt-2">
                            {isId ? "Silakan periksa kembali beberapa saat lagi." : "Check back soon for updates."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
