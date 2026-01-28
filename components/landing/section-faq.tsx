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
                    <AccordionItem value="item-1" className="border-b border-white/10">
                        <AccordionTrigger className="hover:no-underline hover:text-white">{t("q1")}</AccordionTrigger>
                        <AccordionContent className="text-zinc-500">
                            {t("a1")}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b border-white/10">
                        <AccordionTrigger className="hover:no-underline hover:text-white">{t("q2")}</AccordionTrigger>
                        <AccordionContent className="text-zinc-500">
                            {t("a2")}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b border-white/10">
                        <AccordionTrigger className="hover:no-underline hover:text-white">{t("q3")}</AccordionTrigger>
                        <AccordionContent className="text-zinc-500">
                            {t("a3")}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
