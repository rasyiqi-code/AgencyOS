'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/i18n/hooks";
import { TestimonialCard } from "./testimonial-card";

import { getSystemSettings, getActiveTestimonials } from "@/src/server/settings";

interface DBTestimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string | null;
    isActive: boolean;
    createdAt: Date;
}

export function Testimonials() {
    const t = useTranslations("Testimonials");
    const [agencyName, setAgencyName] = useState("Agency OS");
    const [reviews, setReviews] = useState<{ name: string; role: string; text: string; image: string }[]>([]);

    useEffect(() => {
        // Mengamankan pemanggilan Promise.all dengan catch block agar jika salah satu server function gagal, aplikasi tidak crash
        Promise.all([
            getSystemSettings({ data: ["AGENCY_NAME"] }).catch(() => [{ key: "AGENCY_NAME", value: "Agency OS" }]),
            getActiveTestimonials({ data: 10 }).catch(() => []),
        ]).then(([settings, dbTestimonials]) => {
            const name = (settings as { key: string; value: string }[]).find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";
            setAgencyName(name);

            if (dbTestimonials && (dbTestimonials as unknown[]).length > 0) {
                setReviews(
                    (dbTestimonials as unknown as DBTestimonial[]).map(item => ({
                        name: item.name || "User",
                        role: item.role || "Client",
                        text: item.content || "",
                        image: item.avatar || "",
                    }))
                );
            } else {
                setReviews(
                    [0, 1, 2, 3, 4].map(i => ({
                        name: t(`reviews.${i}.name`),
                        role: t(`reviews.${i}.role`),
                        text: t(`reviews.${i}.text`, { brand: name }),
                        image: `https://i.pravatar.cc/64?u=user${i + 1}`,
                    }))
                );
            }
        }).catch((err) => {
            console.error("Gagal memuat testimoni, menggunakan fallback statis:", err);
            setReviews(
                [0, 1, 2, 3, 4].map(i => ({
                    name: t(`reviews.${i}.name`),
                    role: t(`reviews.${i}.role`),
                    text: t(`reviews.${i}.text`, { brand: "Agency OS" }),
                    image: `https://i.pravatar.cc/64?u=user${i + 1}`,
                }))
            );
        });
    }, []);

    // Duplicate list to ensure smooth marquee if few items
    // Minimum 3 sets
    const displayReviews = [...reviews, ...reviews, ...reviews];

    return (
        <section className="py-20 bg-black overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-4 mb-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t("title", { brand: agencyName })}</h2>
                <p className="text-zinc-500">{t("subtitle", { brand: agencyName })}</p>
            </div>

            <div className="relative w-full">
                {/* Gradient Masks for smooth fade out at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                {/* Marquee Container */}
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] group">
                    <div className="flex gap-6 px-3">
                        {displayReviews.map((review, i) => (
                            <TestimonialCard key={`review-${i}`} review={review} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

