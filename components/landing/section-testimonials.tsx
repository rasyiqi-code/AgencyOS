import { getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import { prisma } from "@/lib/config/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

function TestimonialCard({ review }: { review: { name: string; role: string; text: string; image: string } }) {
    return (
        <div className="w-[350px] bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex-shrink-0 backdrop-blur-sm hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-white/10 ring-2 ring-white/5">
                        <AvatarImage src={review.image} className="object-cover" />
                        <AvatarFallback className="bg-zinc-800 text-white font-bold text-sm">
                            {review.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="text-white font-semibold text-sm">{review.name}</div>
                        <div className="text-zinc-500 text-xs">{review.role}</div>
                    </div>
                </div>
                <Quote className="w-5 h-5 text-brand-yellow/40" />
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">
                &quot;{review.text}&quot;
            </p>
        </div>
    );
}
