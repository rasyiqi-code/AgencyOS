import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import { Save, TrendingUp, DollarSign } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";
import { pricingService } from "@/lib/server/pricing-service";

export default async function AdminPricingPage() {
    const pricing = await pricingService.getConfig();

    async function updatePricing(formData: FormData) {
        "use server";
        const baseRate = parseFloat(formData.get("base_rate") as string);
        const low = parseFloat(formData.get("mult_low") as string);
        const med = parseFloat(formData.get("mult_med") as string);
        const high = parseFloat(formData.get("mult_high") as string);

        await pricingService.saveConfig({
            baseRate: baseRate || 15,
            multipliers: {
                Low: low || 1.0,
                Medium: med || 1.25,
                High: high || 1.5
            }
        });

        revalidatePath("/admin/system/pricing");
    }

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">System Configuration</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Pricing Strategy
                        <TrendingUp className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Configure base rates and AI complexity multipliers for automated estimates.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Pricing Config Form */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-lime-500" />
                                    AI Pricing Model
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">Configure base rates and complexity multipliers.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <form action={updatePricing} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                                        <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-2">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            Base Hourly Rate (USD)
                                        </label>
                                        <Input
                                            name="base_rate"
                                            type="number"
                                            step="0.01"
                                            defaultValue={pricing.baseRate}
                                            className="bg-black/20 border-white/10 text-white font-mono text-lg"
                                        />
                                        <p className="text-xs text-zinc-600 mt-1">Standard rate for calculation before multipliers.</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-emerald-500 uppercase">Low Complexity</label>
                                            <Input
                                                name="mult_low"
                                                type="number"
                                                step="0.1"
                                                defaultValue={pricing.multipliers.Low}
                                                className="bg-black/20 border-white/10 text-white font-mono"
                                            />
                                            <span className="text-[10px] text-zinc-500">Multiplier (e.g. 1.0x)</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-yellow-500 uppercase">Medium Complexity</label>
                                            <Input
                                                name="mult_med"
                                                type="number"
                                                step="0.1"
                                                defaultValue={pricing.multipliers.Medium}
                                                className="bg-black/20 border-white/10 text-white font-mono"
                                            />
                                            <span className="text-[10px] text-zinc-500">Multiplier (e.g. 1.25x)</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-red-500 uppercase">High Complexity</label>
                                            <Input
                                                name="mult_high"
                                                type="number"
                                                step="0.1"
                                                defaultValue={pricing.multipliers.High}
                                                className="bg-black/20 border-white/10 text-white font-mono"
                                            />
                                            <span className="text-[10px] text-zinc-500">Multiplier (e.g. 1.5x)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                    <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-black font-medium">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Pricing Model
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
