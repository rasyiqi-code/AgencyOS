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
    const { currency: contextCurrency, rate } = useCurrency();
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(initialPrice);
    const [tempPrice, setTempPrice] = useState(initialPrice);
    const [isLoading, setIsLoading] = useState(false);

    const getDisplayPrice = (baseVal: number) => {
        if (currency === 'USD' && contextCurrency === 'IDR') return baseVal * rate;
        if (currency === 'IDR' && contextCurrency === 'USD') return baseVal / rate;
        return baseVal;
    };

    const handleSave = async () => {
        if (isNaN(tempPrice) || tempPrice <= 0) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("estimateId", estimateId);
        formData.append("projectId", projectId || "");
        formData.append("newPrice", tempPrice.toString());
        formData.append("contextCurrency", contextCurrency);
        formData.append("activeRate", rate.toString());

        const result = await setQuotePrice(formData);
        if (result?.success) {
            const newBasePrice = (contextCurrency === 'USD' && currency === 'IDR') ? tempPrice * rate :
                (contextCurrency === 'IDR' && currency === 'USD') ? tempPrice / rate :
                    tempPrice;
            setPrice(newBasePrice);
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
                    onClick={() => {
                        setTempPrice(getDisplayPrice(price));
                        setIsEditing(true);
                    }}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white shrink-0 -ml-8"
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
                <div className="flex flex-col items-start sm:items-end">
                    <span className="text-emerald-400 font-bold font-mono text-sm whitespace-nowrap">
                        <PriceDisplay amount={price} baseCurrency={currency as 'USD' | 'IDR'} />
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-start sm:justify-end gap-2 animate-in fade-in slide-in-from-right-1">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-zinc-500 text-xs font-mono">{contextCurrency === 'IDR' ? 'Rp' : '$'}</span>
                </div>
                <Input
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(parseFloat(e.target.value))}
                    className={`w-32 h-8 bg-black/40 border-zinc-700 text-xs text-white pr-2 rounded-lg focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/30 font-mono transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield] ${contextCurrency === 'IDR' ? 'pl-8' : 'pl-6'}`}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') {
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
