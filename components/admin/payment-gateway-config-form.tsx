"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, EyeOff, Loader2, CreditCard, Store } from "lucide-react";
import { toast } from "sonner";

interface PaymentGatewayConfig {
    midtrans?: {
        serverKey: string;
        clientKey: string;
        merchantId: string;
        isProduction: boolean;
    };
    creem?: {
        apiKey: string;
        storeId: string;
        isProduction: boolean;
    };
}

export function PaymentGatewayConfigForm({ initialConfig }: { initialConfig: PaymentGatewayConfig }) {
    const [midtransConfig, setMidtransConfig] = useState(initialConfig.midtrans || {
        serverKey: '',
        clientKey: '',
        merchantId: '',
        isProduction: false
    });

    const [creemConfig, setCreemConfig] = useState(initialConfig.creem || {
        apiKey: '',
        storeId: '',
        isProduction: false
    });

    const [showMidtransKeys, setShowMidtransKeys] = useState(false);
    const [showCreemKey, setShowCreemKey] = useState(false);
    const [savingMidtrans, setSavingMidtrans] = useState(false);
    const [savingCreem, setSavingCreem] = useState(false);

    const handleSaveMidtrans = async () => {
        setSavingMidtrans(true);
        try {
            const res = await fetch("/api/admin/system/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateway: "midtrans", config: midtransConfig })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save");

            toast.success("Midtrans configuration saved successfully");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save Midtrans configuration");
        } finally {
            setSavingMidtrans(false);
        }
    };

    const handleSaveCreem = async () => {
        setSavingCreem(true);
        try {
            const res = await fetch("/api/admin/system/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateway: "creem", config: creemConfig })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save");

            toast.success("Creem configuration saved successfully");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save Creem configuration");
        } finally {
            setSavingCreem(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Midtrans Configuration */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            Midtrans Payment Gateway
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Configure Midtrans API credentials and mode.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                                Server Key
                                <button
                                    type="button"
                                    onClick={() => setShowMidtransKeys(!showMidtransKeys)}
                                    className="text-zinc-500 hover:text-zinc-300"
                                >
                                    {showMidtransKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </label>
                            <Input
                                type={showMidtransKeys ? "text" : "password"}
                                value={midtransConfig.serverKey}
                                onChange={(e) => setMidtransConfig({ ...midtransConfig, serverKey: e.target.value })}
                                placeholder="Mid-server-xxxxx"
                                className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Client Key</label>
                            <Input
                                type={showMidtransKeys ? "text" : "password"}
                                value={midtransConfig.clientKey}
                                onChange={(e) => setMidtransConfig({ ...midtransConfig, clientKey: e.target.value })}
                                placeholder="Mid-client-xxxxx"
                                className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Merchant ID</label>
                        <Input
                            value={midtransConfig.merchantId}
                            onChange={(e) => setMidtransConfig({ ...midtransConfig, merchantId: e.target.value })}
                            placeholder="G123456789"
                            className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-blue-500/20"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-white/5">
                        <div>
                            <p className="text-sm font-medium text-white">Production Mode</p>
                            <p className="text-xs text-zinc-500">Enable for live transactions (disable for sandbox)</p>
                        </div>
                        <Switch
                            checked={midtransConfig.isProduction}
                            onCheckedChange={(checked) => setMidtransConfig({ ...midtransConfig, isProduction: checked })}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button
                            onClick={handleSaveMidtrans}
                            disabled={savingMidtrans || !midtransConfig.serverKey || !midtransConfig.clientKey || !midtransConfig.merchantId}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
                        >
                            {savingMidtrans ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Midtrans Config
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Creem Configuration */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Store className="w-4 h-4 text-purple-500" />
                            Creem Payment Gateway
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Configure Creem.io API credentials and mode.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                            API Key
                            <button
                                type="button"
                                onClick={() => setShowCreemKey(!showCreemKey)}
                                className="text-zinc-500 hover:text-zinc-300"
                            >
                                {showCreemKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </label>
                        <Input
                            type={showCreemKey ? "text" : "password"}
                            value={creemConfig.apiKey}
                            onChange={(e) => setCreemConfig({ ...creemConfig, apiKey: e.target.value })}
                            placeholder="creem_test_xxxxx or creem_live_xxxxx"
                            className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-purple-500/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Store ID</label>
                        <Input
                            value={creemConfig.storeId}
                            onChange={(e) => setCreemConfig({ ...creemConfig, storeId: e.target.value })}
                            placeholder="sto_xxxxx"
                            className="bg-black/20 border-white/10 text-zinc-200 font-mono text-sm focus-visible:ring-purple-500/20"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-white/5">
                        <div>
                            <p className="text-sm font-medium text-white">Live Mode</p>
                            <p className="text-xs text-zinc-500">Enable for production (disable for test mode)</p>
                        </div>
                        <Switch
                            checked={creemConfig.isProduction}
                            onCheckedChange={(checked) => setCreemConfig({ ...creemConfig, isProduction: checked })}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button
                            onClick={handleSaveCreem}
                            disabled={savingCreem || !creemConfig.apiKey || !creemConfig.storeId}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
                        >
                            {savingCreem ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Creem Config
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
