"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Save, DollarSign, Clock } from "lucide-react";
import { getCurrencyConfig, saveCurrencyConfig, forceUpdateCurrencyRates } from "@/app/actions/system-admin";

interface CurrencyConfig {
    apiKey?: string | null;
    intervalHours?: number | null;
}

interface CurrencyRates {
    base: string;
    rates: Record<string, number>;
    lastUpdated: number;
}

interface CurrencyData {
    config: CurrencyConfig | null;
    rates: CurrencyRates | null;
}

export default function CurrencySettingsPage() {
    // Mengambil data konfigurasi mata uang dan kurs menggunakan useQuery
    const { data: currencyData, isLoading, error } = useQuery<CurrencyData>({
        queryKey: ["currencyConfig"],
        queryFn: async () => {
            return await getCurrencyConfig();
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
            </div>
        );
    }

    if (error || !currencyData) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 font-bold">Gagal memuat pengaturan mata uang.</p>
            </div>
        );
    }

    return (
        <CurrencySettingsForm
            initialConfig={currencyData.config}
            initialRates={currencyData.rates}
        />
    );
}

interface CurrencySettingsFormProps {
    initialConfig: CurrencyConfig | null;
    initialRates: CurrencyRates | null;
}

function CurrencySettingsForm({ initialConfig, initialRates }: CurrencySettingsFormProps) {
    const queryClient = useQueryClient();

    // Inisialisasi state langsung dari data props yang sudah selesai di-fetch (menghindari useEffect setState)
    const [apiKey, setApiKey] = useState(initialConfig?.apiKey || "");
    const [intervalHours, setIntervalHours] = useState(initialConfig?.intervalHours || 24);

    // Mutasi untuk menyimpan konfigurasi
    const saveMutation = useMutation({
        mutationFn: async () => {
            await saveCurrencyConfig(apiKey, Number(intervalHours));
        },
        onSuccess: () => {
            toast.success("Pengaturan berhasil disimpan");
            queryClient.invalidateQueries({ queryKey: ["currencyConfig"] });
        },
        onError: () => {
            toast.error("Gagal menyimpan pengaturan");
        }
    });

    // Mutasi untuk memperbarui kurs secara paksa
    const forceUpdateMutation = useMutation({
        mutationFn: async () => {
            return await forceUpdateCurrencyRates();
        },
        onSuccess: () => {
            toast.success("Kurs berhasil diperbarui!");
            queryClient.invalidateQueries({ queryKey: ["currencyConfig"] });
        },
        onError: (e) => {
            toast.error(e instanceof Error ? e.message : "Gagal memperbarui kurs");
        }
    });

    const loading = saveMutation.isPending;
    const fetching = forceUpdateMutation.isPending;

    const handleSave = () => {
        saveMutation.mutate();
    };

    const handleForceUpdate = () => {
        forceUpdateMutation.mutate();
    };

    return (
        <div className="space-y-8 p-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    Currency Settings
                    <DollarSign className="w-6 h-6 text-zinc-600" />
                </h1>
                <p className="text-zinc-400 mt-1.5 text-sm">
                    Configure exchange rate API and update Schedule.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Configuration Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Configuration</h2>
                            <p className="text-xs text-zinc-500">API Provider: CurrencyFreaks</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="CurrencyFreaks API Key"
                                className="bg-black/50 border-white/10 font-mono text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Update Interval (Hours)</Label>
                            <Input
                                type="number"
                                value={intervalHours}
                                onChange={(e) => setIntervalHours(Number(e.target.value))}
                                min={1}
                                className="bg-black/50 border-white/10 text-white"
                            />
                            <p className="text-xs text-zinc-500">How often to fetch new rates automatically.</p>
                        </div>

                        <Button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Configuration
                        </Button>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Exchange Rates</h2>
                            <p className="text-xs text-zinc-500">Base Currency: USD</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-8 bg-black/30 rounded-lg border border-white/5 mb-6">
                        {initialRates ? (
                            <>
                                <div className="text-4xl font-mono font-bold text-white mb-2">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(initialRates.rates.IDR)}
                                </div>
                                <div className="text-sm text-zinc-500 font-mono">1 USD = {initialRates.rates.IDR} IDR</div>
                                <div className="mt-4 text-xs text-zinc-600 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                                    Updated: {new Date(initialRates.lastUpdated).toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <div className="text-zinc-500 text-sm">No rates cached yet.</div>
                        )}
                    </div>

                    <Button
                        onClick={handleForceUpdate}
                        disabled={fetching || !apiKey}
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/5 text-zinc-300"
                    >
                        {fetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Force Update Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
