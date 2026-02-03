"use client";

import { useEffect } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ServiceCard } from "@/components/public/service-card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency?: string | null;
    interval: string;
    features: unknown;
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
    const searchParams = useSearchParams();

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
                        const res = await fetch("/api/store/order", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ serviceId: pendingServiceId })
                        });

                        const data = await res.json();

                        if (!res.ok) {
                            toast.error(data.error || "Failed to create order");
                            return;
                        }

                        if (data.url) {
                            router.push(data.url);
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

    return (
        <div className="relative bg-black overflow-hidden">
            {/* Landing Style Background */}
            <div className="absolute inset-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial Gradient overlay */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand-yellow/10 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-12 sm:py-24 relative z-10">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white mb-6 transition-colors gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-brand-yellow" />
                        {pageTitle || "Premium Services"}
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        {pageSubtitle || "Scale your business with our productized services. High-quality deliverables, transparent pricing, and rapid turnaround times."}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}

                    {services.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
                            <p className="text-zinc-500 text-lg">No services available publicly at the moment.</p>
                            <p className="text-zinc-600 text-sm mt-2">Check back soon for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
