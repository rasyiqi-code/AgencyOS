import { getPortfolios } from "@/lib/portfolios/actions";
import { PortfolioManager } from "@/components/admin/portfolio/portfolio-manager";
import { Badge } from "@/components/ui/badge";
import { Layout } from "lucide-react";

export default async function AdminPortfolioPage() {
    const portfolios = await getPortfolios();

    return (
        <div className="relative min-h-screen">
            {/* Premium Background Elements */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-brand-yellow border-brand-yellow/20 bg-brand-yellow/5 uppercase tracking-widest text-[9px] font-bold">
                            Content Management
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
                        Portfolio Live Admin
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <Layout className="w-5 h-5 text-brand-yellow" />
                        </div>
                    </h1>
                    <p className="text-zinc-500 mt-3 max-w-2xl text-sm md:text-base leading-relaxed">
                        Manage your website showcase with precision. <span className="text-zinc-300">HTML files</span> are served from the local filesystem for maximum edge performance.
                    </p>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                <PortfolioManager initialData={portfolios} />
            </div>
        </div>
    );
}
