import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { getTranslations } from "next-intl/server";

export async function FAQSection() {
    const t = await getTranslations("FAQ");

    return (
        <section className="py-24 bg-brand-yellow relative overflow-hidden">
            {/* Pola background mesh/crosshatch yang stabil */}
            <div className="absolute inset-0 z-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(45deg, #000 0.5px, transparent 0.5px), linear-gradient(-45deg, #000 0.5px, transparent 0.5px)`,
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="container mx-auto px-4 max-w-3xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter italic uppercase">
                        {t("title")}
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full text-black">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-b border-black/10">
                            <AccordionTrigger className="hover:no-underline hover:text-black/70 text-left font-bold tracking-tight">
                                {t(`q${i}`)}
                            </AccordionTrigger>
                            <AccordionContent className="text-black/60 font-medium leading-relaxed">
                                {t.rich(`a${i}`, {
                                    strong: (chunks) => <strong className="text-black font-black">{chunks}</strong>
                                })}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* FAQ Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
                                "@type": "Question",
                                "name": t(`q${i}`),
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": (t.raw("a" + i) as string).replace(/<\/?[^>]+(>|$)/g, "")
                                }
                            }))
                        })
                    }}
                />
            </div>
        </section>
    )
}
