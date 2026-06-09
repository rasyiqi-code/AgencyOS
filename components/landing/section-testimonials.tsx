'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
        Promise.all([
            getSystemSettings(["AGENCY_NAME"]),
            getActiveTestimonials(10),
        ]).then(([settings, dbTestimonials]) => {
            const name = (settings as { key: string; value: string }[]).find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";
            setAgencyName(name);

            if ((dbTestimonials as unknown[]).length > 0) {
                setReviews(
                    (dbTestimonials as unknown as DBTestimonial[]).map(item => ({
                        name: item.name,
                        role: item.role,
                        text: item.content,
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

