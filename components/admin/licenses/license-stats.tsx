import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, CheckCircle, Package } from "lucide-react";

interface LicenseStatsProps {
    totalLicenses: number;
    activeLicenses: number;
    totalProducts: number;
}

export function LicenseStats({ totalLicenses, activeLicenses, totalProducts }: LicenseStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Lisensi</CardTitle>
                    <Key className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand-yellow/70" />
                </CardHeader>
                <CardContent className="p-3 md:p-5 pt-1 md:pt-1">
                    <div className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">{totalLicenses}</div>
                    <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">
                        Key Diterbitkan
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lisensi Aktif</CardTitle>
                    <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500/70" />
                </CardHeader>
                <CardContent className="p-3 md:p-5 pt-1 md:pt-1">
                    <div className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">{activeLicenses}</div>
                    <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">
                        Sedang Digunakan
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20 overflow-hidden col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Produk Terlisensi</CardTitle>
                    <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500/70" />
                </CardHeader>
                <CardContent className="p-3 md:p-5 pt-1 md:pt-1">
                    <div className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">{totalProducts}</div>
                    <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">
                        Katalog Aktif
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
