import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, CheckCircle, Package } from "lucide-react";

interface LicenseStatsProps {
    totalLicenses: number;
    activeLicenses: number;
    totalProducts: number;
}

export function LicenseStats({ totalLicenses, activeLicenses, totalProducts }: LicenseStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Licenses</CardTitle>
                    <Key className="h-4 w-4 text-brand-yellow/70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{totalLicenses}</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Issued keys across all products
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Active Keys</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500/70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{activeLicenses}</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Currently valid and in use
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Products Licensed</CardTitle>
                    <Package className="h-4 w-4 text-blue-500/70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{totalProducts}</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Products with at least one key
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
