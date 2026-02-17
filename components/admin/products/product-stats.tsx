import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Zap } from "lucide-react";

interface ProductStatsProps {
    totalProducts: number;
    activeProducts: number;
    topProduct: { name: string; licenses: number } | null;
}

export function ProductStats({ totalProducts, activeProducts, topProduct }: ProductStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Products</CardTitle>
                    <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500/70" />
                </CardHeader>
                <CardContent className="p-3 md:p-5 pt-1 md:pt-1">
                    <div className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">{totalProducts}</div>
                    <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">
                        Listing Catalog
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Listing</CardTitle>
                    <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand-yellow/70" />
                </CardHeader>
                <CardContent className="p-3 md:p-5 pt-1 md:pt-1">
                    <div className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">{activeProducts}</div>
                    <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">
                        Available for Sale
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20 overflow-hidden col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Top Product</CardTitle>
                    <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500/70" />
                </CardHeader>
                <CardContent className="p-3 md:p-5 pt-1 md:pt-1">
                    <div className="text-sm md:text-lg font-black text-white truncate uppercase tracking-tight" title={topProduct?.name || "N/A"}>
                        {topProduct ? topProduct.name : "N/A"}
                    </div>
                    <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">
                        {topProduct ? `${topProduct.licenses} licenses issued` : "No data yet"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
