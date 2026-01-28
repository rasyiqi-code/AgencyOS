"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Save, DollarSign, Clock } from "lucide-react";
import type { ExchangeRates } from "@/types/payment";

export default function CurrencySettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Config State
    const [apiKey, setApiKey] = useState("");
    const [intervalHours, setIntervalHours] = useState(24);

    // Status State
    const [rates, setRates] = useState<ExchangeRates | null>(null);

    const loadData = async () => {
        try {
            const res = await fetch("/api/admin/system/currency");
            const data = await res.json();

            if (data.config) {
                setApiKey(data.config.apiKey || "");
                setIntervalHours(data.config.intervalHours || 24);
            }
            if (data.rates) {
                setRates(data.rates);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/system/currency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey, intervalHours: Number(intervalHours) })
            });

            if (!res.ok) throw new Error("Failed to save");
            toast.success("Settings saved");
            loadData();
        } catch {
            toast.error("Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    const handleForceUpdate = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/system/currency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "force_update" })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Update failed");
            }

            const newRates = await res.json();
            setRates(newRates);
            toast.success("Rates updated successfully!");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update rates");
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="space-y-8 p-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Currency Settings</h1>
                <p className="text-zinc-400">Configure exchange rate API and update Schedule.</p>
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
                        {rates ? (
                            <>
                                <div className="text-4xl font-mono font-bold text-white mb-2">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rates.rates.IDR)}
                                </div>
                                <div className="text-sm text-zinc-500 font-mono">1 USD = {rates.rates.IDR} IDR</div>
                                <div className="mt-4 text-xs text-zinc-600 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                                    Updated: {new Date(rates.lastUpdated).toLocaleString()}
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
