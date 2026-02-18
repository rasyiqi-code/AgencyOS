import { getPortfolios } from "@/lib/portfolios/actions";
import { PortfolioManager } from "@/components/admin/portfolio/portfolio-manager";
import { Badge } from "@/components/ui/badge";
import { Layout } from "lucide-react";

export default async function AdminPortfolioPage() {
    const portfolios = await getPortfolios();

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[9px]">
                        Content Management
                    </Badge>
                </div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    Portfolio Live Admin
                    <Layout className="w-6 h-6 text-zinc-600" />
                </h1>
                <p className="text-zinc-400 mt-2">
                    Manage your website showcase. HTML files are stored in the local filesystem for performance.
                </p>
            </div>

            <PortfolioManager initialData={portfolios} />
        </div>
    );
}
