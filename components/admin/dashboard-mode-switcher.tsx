"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Cpu } from "lucide-react";

/**
 * Komponen Switcher untuk memilih antara tampilan dashboard Jasa Agensi dan Produk Digital.
 * Memperbarui parameter URL (?mode=...) secara reaktif.
 */
export function DashboardModeSwitcher() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMode = searchParams.get("mode") || "services";

    const handleModeChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", val);
        router.push(`?${params.toString()}`);
    };

    return (
        <Tabs value={currentMode} onValueChange={handleModeChange} className="w-full sm:w-auto">
            <TabsList className="bg-zinc-900 border border-white/5 p-1 rounded-xl h-11">
                <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs font-bold gap-2 px-4 rounded-lg">
                    <Briefcase className="w-3.5 h-3.5" />
                    Jasa Agensi
                </TabsTrigger>
                <TabsTrigger value="digital" className="data-[state=active]:bg-white data-[state=active]:text-black text-xs font-bold gap-2 px-4 rounded-lg">
                    <Cpu className="w-3.5 h-3.5" />
                    Produk Digital
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
