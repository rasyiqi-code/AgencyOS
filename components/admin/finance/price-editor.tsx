"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { setQuotePrice } from "@/app/actions/quotes";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";

interface PriceEditorProps {
    estimateId: string;
    projectId: string | null;
    initialPrice: number;
    currency?: string;
}

export function PriceEditor({ estimateId, projectId, initialPrice, currency = 'IDR' }: PriceEditorProps) {
    const { currency: contextCurrency } = useCurrency();
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(initialPrice);
    const [tempPrice, setTempPrice] = useState(initialPrice);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (isNaN(tempPrice) || tempPrice <= 0) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("estimateId", estimateId);
        formData.append("projectId", projectId || "");
        formData.append("newPrice", tempPrice.toString());

        const result = await setQuotePrice(formData);
        if (result?.success) {
            setPrice(tempPrice);
            setIsEditing(false);
        } else {
            alert(result?.error || "Gagal memperbarui harga");
        }
        setIsLoading(false);
    };

    if (!isEditing) {
        return (
            <div className="flex items-center justify-start sm:justify-end gap-2 group w-full">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white shrink-0 -ml-8"
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
                <div className="flex flex-col items-start sm:items-end">
                    <span className="text-emerald-400 font-bold font-mono text-sm whitespace-nowrap">
                        <PriceDisplay amount={price} forceCurrency={currency as 'USD' | 'IDR'} />
                    </span>
                    {contextCurrency !== currency && (
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5 whitespace-nowrap text-right" title="Nilai estimasi saat ini di mata uang preferensi Anda">
                            ≈ <PriceDisplay amount={price} baseCurrency={currency as 'USD' | 'IDR'} />
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-start sm:justify-end gap-2 animate-in fade-in slide-in-from-right-1">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <span className="text-zinc-500 text-xs font-mono">{currency === 'IDR' ? 'Rp' : '$'}</span>
                </div>
                <Input
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(parseFloat(e.target.value))}
                    className="w-28 h-8 bg-black/60 border-zinc-700 text-xs text-white pl-7 pr-2 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') {
                            setTempPrice(price);
                            setIsEditing(false);
                        }
                    }}
                />
            </div>
            <div className="flex gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/20"
                >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        setTempPrice(price);
                        setIsEditing(false);
                    }}
                    disabled={isLoading}
                    className="h-8 w-8 text-zinc-500 hover:bg-white/5 border border-zinc-800"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
