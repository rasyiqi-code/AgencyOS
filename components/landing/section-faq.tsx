import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
    return (
        <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full text-zinc-300">
                    <AccordionItem value="item-1" className="border-b border-white/10">
                        <AccordionTrigger className="hover:no-underline hover:text-white">Apakah saya benar-benar tidak bisa ngobrol langsung?</AccordionTrigger>
                        <AccordionContent className="text-zinc-500">
                            Platform kami didesain untuk Asynchronous agar efisien. Semua tercatat rapi. Tapi untuk situasi darurat atau konsultasi strategi mendalam, sesi Call Premium tersedia.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b border-white/10">
                        <AccordionTrigger className="hover:no-underline hover:text-white">Bagaimana jika ada bug setelah selesai?</AccordionTrigger>
                        <AccordionContent className="text-zinc-500">
                            Semua paket termasuk Garansi Bug 30 Hari. Lapor via dashboard, perbaikan diprioritaskan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b border-white/10">
                        <AccordionTrigger className="hover:no-underline hover:text-white">Apakah source code menjadi milik saya?</AccordionTrigger>
                        <AccordionContent className="text-zinc-500">
                            Ya, 100%. Setelah pelunasan, repositori GitHub akan ditransfer ke akun Anda.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
