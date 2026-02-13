import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Zap } from "lucide-react";

interface ProductStatsProps {
    totalProducts: number;
    activeProducts: number;
    topProduct: { name: string; licenses: number } | null;
}

export function ProductStats({ totalProducts, activeProducts, topProduct }: ProductStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-purple-500/70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{totalProducts}</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Templates & Plugins
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Active Listing</CardTitle>
                    <Zap className="h-4 w-4 text-brand-yellow/70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{activeProducts}</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Currently available for sale
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Top Product</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500/70" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-white truncate" title={topProduct?.name || "N/A"}>
                        {topProduct ? topProduct.name : "N/A"}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                        {topProduct ? `${topProduct.licenses} licenses issued` : "No data yet"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
