"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Globe, Database, Code, RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { simulateWebhook } from "@/app/actions/webhooks";
import { WEBHOOK_PAYLOAD } from "@/components/public/docs/constants";

interface Product {
    id: string;
    name: string;
    slug: string;
    externalWebhookUrl: string | null;
}

export function WebhookSimulator({ products }: { products: Product[] }) {
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [payload, setPayload] = useState<string>(WEBHOOK_PAYLOAD);
    const [isLoading, setIsLoading] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; error?: string; status?: number } | null>(null);

    const activeProduct = products.find(p => p.id === selectedProductId);

    const handleSimulate = async () => {
        if (!activeProduct?.externalWebhookUrl) {
            toast.error("Product has no external webhook URL configured.");
            return;
        }

        try {
            setIsLoading(true);
            setLastResult(null);
            
            let parsedPayload;
            try {
                parsedPayload = JSON.parse(payload);
            } catch {
                toast.error("Invalid JSON payload");
                setIsLoading(false);
                return;
            }

            const result = await simulateWebhook({
                url: activeProduct.externalWebhookUrl,
                payload: parsedPayload
            });

            setLastResult(result as { success: boolean; error?: string; status?: number });
            if (result.success) {
                toast.success("Webhook delivered successfully!");
            } else {
                toast.error(`Delivery failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetPayload = () => {
        setPayload(WEBHOOK_PAYLOAD);
        toast.info("Payload reset to default");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900/50 border-white/5 shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-zinc-900/80">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Database className="w-5 h-5 text-brand-yellow" />
                        Simulation Settings
                    </CardTitle>
                    <CardDescription>Configure the target and sample data</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Target Product</Label>
                        <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                            <SelectTrigger className="bg-zinc-950 border-white/10 text-white">
                                <SelectValue placeholder="Select a product to test" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id} className="focus:bg-brand-yellow focus:text-black">
                                        {p.name} ({p.slug})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Destination URL</Label>
                            {activeProduct?.externalWebhookUrl ? (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> CONFIGURED
                                </span>
                            ) : (
                                <span className="text-[10px] text-zinc-600 font-bold italic">NOT SET</span>
                            )}
                        </div>
                        <div className="text-sm font-mono text-zinc-300 break-all p-3 rounded-lg bg-black/40 border border-white/5 min-h-[40px]">
                            {activeProduct?.externalWebhookUrl || "---"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400">Payload (JSON)</Label>
                            <Button variant="ghost" size="sm" onClick={resetPayload} className="h-7 text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-white">
                                <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                            </Button>
                        </div>
                        <textarea
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            className="w-full h-80 bg-zinc-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400/80 focus:ring-1 focus:ring-brand-yellow/50 outline-none resize-none selection:bg-brand-yellow/30"
                            placeholder='{ "event": "subscription.activated", ... }'
                        />
                    </div>
                </CardContent>
                <CardFooter className="p-6 bg-zinc-900/30 border-t border-white/5">
                    <Button 
                        onClick={handleSimulate} 
                        disabled={isLoading || !activeProduct?.externalWebhookUrl}
                        className="w-full h-12 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-bold uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-brand-yellow/10"
                    >
                        {isLoading ? (
                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Trigger Simulation
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                <Card className="bg-zinc-900/50 border-white/5 shadow-2xl h-full flex flex-col">
                    <CardHeader className="border-b border-white/5 bg-zinc-900/80">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Code className="w-5 h-5 text-brand-yellow" />
                            Live Delivery Log
                        </CardTitle>
                        <CardDescription>Real-time result of the outgoing request</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                        {!lastResult ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <div className="p-6 rounded-full bg-zinc-800">
                                    <Globe className="w-12 h-12" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold uppercase tracking-widest">Idle System</p>
                                    <p className="text-xs">No active simulation triggered yet.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className={`p-6 rounded-2xl border ${lastResult.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${lastResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {lastResult.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-bold ${lastResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {lastResult.success ? 'Delivery Succeeded' : 'Delivery Failed'}
                                            </h4>
                                            <p className="text-zinc-500 text-sm">
                                                {lastResult.success ? 'Status Code: 200 OK' : `Error: ${lastResult.error || 'Failed to connect'}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Response Analysis</Label>
                                    <div className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-xs text-zinc-400 min-h-[200px] overflow-auto">
                                        {lastResult.success ? (
                                            <div className="space-y-4">
                                                <div className="text-emerald-400">✓ Endpoint processed the request successfully.</div>
                                                <div className="text-zinc-500">
                                                    Your external application should have received the payload and updated its internal subscription state.
                                                </div>
                                                <div className="pt-4 border-t border-white/5 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Trace Log</div>
                                                <div className="text-zinc-600">
                                                    [{new Date().toISOString()}] POST {activeProduct?.externalWebhookUrl}<br/>
                                                    [{new Date().toISOString()}] Payload Sent (Size: {payload.length} bytes)<br/>
                                                    [{new Date().toISOString()}] Receive ACK (200 OK)
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 text-red-400/80">
                                                <div>✗ Failed to reach the destination URL.</div>
                                                <div className="text-zinc-500 text-xs">
                                                    Possible causes:<br/>
                                                    1. Endpoint URL is incorrect or typo used.<br/>
                                                    2. Server is down or behind a restrictive firewall.<br/>
                                                    3. SSL certificate is invalid for HTTPS.<br/>
                                                    4. Port 80/443 is blocked.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
