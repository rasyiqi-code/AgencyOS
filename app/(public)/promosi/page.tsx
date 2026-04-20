import { getPromotions } from "@/lib/server/marketing";
import { PromoCard } from "@/components/marketing/promo-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Promosi & Penawaran Spesial | AgencyOS",
    description: "Temukan berbagai promo menarik, diskon spesial, dan penawaran terbatas untuk layanan kami.",
};

export default async function PromosiPage() {
    const promotions = await getPromotions(true);

    return (
        <div className="min-h-screen bg-black pt-32 pb-20">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="relative mb-20 text-center">
                    <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-yellow/10 blur-[120px]" />
                    <h1 className="mb-6 text-5xl font-black tracking-tight text-white md:text-7xl">
                        Penawaran <span className="bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow bg-clip-text text-transparent">Eksklusif</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-zinc-400 leading-relaxed">
                        Akselerasikan pertumbuhan bisnis Anda dengan berbagai pilihan promo dan bonus eksklusif yang dirancang khusus untuk mitra strategis kami.
                    </p>
                </div>


                {/* Promotions Grid - Masonry Layout */}
                {promotions.length > 0 ? (
                    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
                        {promotions.map((promo: {
                            id: string;
                            title: string;
                            description: string | null;
                            imageUrl: string;
                            ctaText: string | null;
                            ctaUrl: string | null;
                            couponCode: string | null;
                            endDate: Date | null;
                        }) => (
                            <PromoCard 
                                key={promo.id} 
                                promotion={{
                                    ...promo,
                                    endDate: promo.endDate ? promo.endDate.toISOString() : null
                                }} 
                            />
                        ))}

                    </div>


                ) : (
                    <div className="flex flex-col items-center justify-center rounded-[3px] border border-white/5 bg-zinc-900/20 py-20 text-center backdrop-blur-sm">
                        <div className="mb-6 rounded-full bg-brand-yellow/5 p-6 border border-brand-yellow/10">
                            <svg className="h-12 w-12 text-brand-yellow/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-semibold text-white">Belum ada promo aktif</h2>
                        <p className="text-gray-400">Silakan kembali lagi nanti untuk penawaran menarik lainnya.</p>
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-20 rounded-[3px] bg-gradient-to-br from-brand-yellow/5 to-zinc-900/50 p-12 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-yellow/5 blur-[100px] rounded-full" />
                    <h3 className="mb-3 text-2xl font-black text-white">Ingin Jadi yang Pertama Tahu?</h3>
                    <p className="mb-10 text-zinc-400 max-w-lg mx-auto">Berlangganan newsletter kami untuk mendapatkan info promo, diskon eksklusif, dan update layanan langsung di inbox Anda.</p>
                    
                    <NewsletterForm />
                </div>


            </div>
        </div>
    );
}
