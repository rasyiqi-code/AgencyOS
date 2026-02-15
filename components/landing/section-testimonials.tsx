import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/config/db";
import { TestimonialCard } from "./testimonial-card";

interface DBTestimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string | null;
    isActive: boolean;
    createdAt: Date;
}

export async function Testimonials() {
    const t = await getTranslations("Testimonials");
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Agency OS";

    // Fetch active testimonials from DB
    const dbTestimonials = await prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit for marquee
    });

    // Fallback to static if no DB data
    let reviews: { name: string; role: string; text: string; image: string }[] = [];

    if (dbTestimonials.length > 0) {
        reviews = (dbTestimonials as unknown as DBTestimonial[]).map(item => ({
            name: item.name,
            role: item.role,
            text: item.content,
            image: item.avatar || ""
        }));
    } else {
        // Use static fallback from translations if DB is empty
        reviews = [0, 1, 2, 3, 4].map((i) => ({
            name: t(`reviews.${i}.name`),
            role: t(`reviews.${i}.role`),
            text: t(`reviews.${i}.text`, { brand: agencyName }),
            image: `https://i.pravatar.cc/150?u=user${i + 1}`
        }));
    }

    // Duplicate list to ensure smooth marquee if few items
    // Minimum 3 sets
    const displayReviews = [...reviews, ...reviews, ...reviews];

    return (
        <section className="py-20 bg-black overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-4 mb-10 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{t("title", { brand: agencyName })}</h2>
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

