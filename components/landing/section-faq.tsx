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
        <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full text-zinc-300">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/10">
                            <AccordionTrigger className="hover:no-underline hover:text-white text-left">
                                {t(`q${i}`)}
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-500 leading-relaxed">
                                {t.rich(`a${i}`, {
                                    strong: (chunks) => <strong className="text-white font-medium">{chunks}</strong>
                                })}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
