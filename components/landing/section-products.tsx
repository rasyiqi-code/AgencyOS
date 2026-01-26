import { BarChart3, Newspaper, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const products = [
    {
        title: "Business Ops Dashboard",
        target: "UKM & Distributor",
        desc: "Ubah tumpukan Excel menjadi aplikasi database internal yang aman. Otomatisasi hitung gaji & komisi.",
        price: "Mulai Rp 15 Jt",
        cta: "Rapikan Data Saya",
        icon: BarChart3,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        link: "/price-calculator"
    },
    {
        title: "The Publisher Engine",
        target: "Media & Penerbit",
        desc: "Portal berita Next.js super cepat dengan CMS redaksi modern. Siap monetisasi iklan & langganan.",
        price: "Mulai Rp 10 Jt",
        cta: "Buat Media Baru",
        icon: Newspaper,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        link: "/price-calculator"
    },
    {
        title: "Custom SaaS MVP",
        target: "Startup Founder",
        desc: "Validasi ide startup Anda dalam 14 hari. AI membangun frontend, Saya membangun backend.",
        price: "Custom Quote via AI",
        cta: "Konsultasi Ide",
        icon: Rocket,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        link: "/price-calculator"
    }
];

export function ProductCatalog() {
    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Solusi Siap Pakai
                    </h2>
                    <p className="text-zinc-400">Pilih paket yang sesuai dengan kebutuhan bisnis Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((p, i) => (
                        <div key={i} className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-900 transition-all hover:border-white/20">
                            <div className={`w-12 h-12 rounded-lg ${p.bg} flex items-center justify-center mb-6`}>
                                <p.icon className={`w-6 h-6 ${p.color}`} />
                            </div>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{p.target}</div>
                            <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
                            <p className="text-zinc-400 mb-8 min-h-[80px] text-sm leading-relaxed">{p.desc}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-white font-bold">{p.price}</span>
                                <Link href={p.link}>
                                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black">
                                        {p.cta}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
