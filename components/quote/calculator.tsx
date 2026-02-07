"use client"

import { useState, useEffect } from "react";
import { calculateProjectQuote, type QuoteParams } from "@/lib/shared/pricing";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import "@/types/payment"; // Window.snap type augmentation

// interface QuoteCalculatorProps { ... } removed


export function QuoteCalculator() {
    const [params, setParams] = useState<QuoteParams>({
        complexity: 'low',
        pages: 5,
        features: {
            auth: true,
            payment: false,
            cms: true,
            ai: false,
            realtime: false,
        }
    });

    const [quote, setQuote] = useState(calculateProjectQuote(params));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setQuote(calculateProjectQuote(params));
    }, [params]);

    const handleFeatureToggle = (key: keyof typeof params.features) => {
        setParams(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [key]: !prev.features[key]
            }
        }));
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-white/10 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Calculator className="w-5 h-5 text-blue-400" />
                    Instant Quote Calculator
                </CardTitle>
                <CardDescription>
                    Estimasi harga transparan berdasarkan algoritma sistem kami.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Complexity Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-300">Tingkat Kompleksitas</Label>
                        <Badge variant="outline" className={`capitalize ${params.complexity === 'low' ? 'text-brand-yellow border-brand-yellow/30' :
                            params.complexity === 'medium' ? 'text-yellow-400 border-yellow-400/30' :
                                'text-red-400 border-red-400/30'
                            }`}>
                            {params.complexity}
                        </Badge>
                    </div>
                    <div className="pt-2">
                        <div className="flex justify-between text-xs text-zinc-500 mb-2 px-1">
                            <span>MVP (Simple)</span>
                            <span>Standard (Pro)</span>
                            <span>Enterprise (Complex)</span>
                        </div>
                        <Slider
                            defaultValue={[0]}
                            max={2}
                            step={1}
                            className="[&>.absolute]:bg-blue-500"
                            onValueChange={(val: number[]) => {
                                const map = ['low', 'medium', 'high'] as const;
                                setParams(p => ({ ...p, complexity: map[val[0]] }))
                            }}
                        />
                    </div>
                </div>

                {/* Pages Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-300">Jumlah Halaman (Estimasi)</Label>
                        <span className="text-white font-mono font-bold">{params.pages} Pages</span>
                    </div>
                    <Slider
                        defaultValue={[5]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={(val: number[]) => setParams(p => ({ ...p, pages: val[0] }))}
                    />
                </div>

                {/* Features Toggles */}
                <div className="space-y-4">
                    <Label className="text-zinc-300">Fitur Tambahan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm text-zinc-200">Authentication</Label>
                                <p className="text-xs text-zinc-500">Login/Register, Secure Session</p>
                            </div>
                            <Switch checked={params.features.auth} onCheckedChange={() => handleFeatureToggle('auth')} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm text-zinc-200">Payment Gateway</Label>
                                <p className="text-xs text-zinc-500">Midtrans/Stripe Integration</p>
                            </div>
                            <Switch checked={params.features.payment} onCheckedChange={() => handleFeatureToggle('payment')} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm text-zinc-200">CMS / Dashboard</Label>
                                <p className="text-xs text-zinc-500">Admin Panel, CRUD Modules</p>
                            </div>
                            <Switch checked={params.features.cms} onCheckedChange={() => handleFeatureToggle('cms')} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm text-zinc-200">AI Integration</Label>
                                <p className="text-xs text-zinc-500">LLM Chat, Text Generation</p>
                            </div>
                            <Switch checked={params.features.ai} onCheckedChange={() => handleFeatureToggle('ai')} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm text-zinc-200">Realtime Features</Label>
                                <p className="text-xs text-zinc-500">Live Notifications, Chat</p>
                            </div>
                            <Switch checked={params.features.realtime} onCheckedChange={() => handleFeatureToggle('realtime')} />
                        </div>
                    </div>
                </div>

                {/* Total Display */}
                <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-zinc-400">Total Estimasi</span>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white tracking-tight">{quote.formattedPrice}</div>
                            <div className="text-sm text-brand-yellow flex items-center justify-end gap-1">
                                <Check className="w-3 h-3" /> Fixed Price Guaranteed
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
                        <span className="text-zinc-500">Durasi Pengerjaan</span>
                        <span className="text-zinc-300 font-medium">~{quote.estimatedDuration} Minggu</span>
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button
                    size="lg"
                    className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-bold h-12"
                    disabled={isLoading}
                    onClick={async () => {
                        setIsLoading(true);
                        try {
                            // 1. Create Estimate
                            const response = await fetch("/api/estimates", {
                                method: "POST",
                                body: JSON.stringify({
                                    type: 'manual',
                                    data: {
                                        title: `Project Quote (${params.pages} Pages)`,
                                        summary: `Generated via Instant Quote Calculator. Complexity: ${params.complexity}. Features: ${Object.keys(params.features).filter(k => params.features[k as keyof typeof params.features]).join(", ")}.`,
                                        complexity: params.complexity,
                                        screens: [{ title: `${params.pages} Pages`, hours: quote.estimatedDuration * 40, description: "Estimated based on page count" }],
                                        apis: [],
                                        totalHours: quote.estimatedDuration * 40,
                                        totalCost: quote.totalPrice,
                                        prompt: "Instant Quote Calculator"
                                    }
                                }),
                            });

                            if (!response.ok) throw new Error("Failed to create estimate");

                            const { id } = await response.json();

                            // 2. Redirect to Checkout
                            window.location.href = `/checkout/${id}`;

                        } catch (error) {
                            console.error("Quote error:", error);
                            toast.error("Gagal memproses quote.");
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4 mr-2" />
                    )}
                    Lanjut ke Rincian & Pembayaran
                </Button>
            </CardFooter>
        </Card>
    )
}
