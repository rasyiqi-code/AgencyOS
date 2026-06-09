import { HeroContent } from "@/components/landing/hero-content";

interface LandingHeroProps {
    agencyName: string;
}

export function LandingHero({ agencyName }: LandingHeroProps) {
    return (
        <section className="relative pt-6 pb-20 md:pt-24 md:pb-0 overflow-hidden min-h-[90vh] flex items-center justify-center">
            <HeroContent agencyName={agencyName} />
        </section>
    );
}
