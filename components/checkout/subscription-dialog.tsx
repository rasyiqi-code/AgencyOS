"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/providers/currency-provider";

export function SubscriptionDialog({ onSubscribe, context }: {
    onSubscribe?: (email: string) => void;
    context?: "DIGITAL" | "SERVICE" | "CALCULATOR";
}) {
    const t = useTranslations("Checkout");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [promoCoupon, setPromoCoupon] = useState<{ code: string, discountValue: number, discountType: string } | null>(null);

    const fetchPromoCoupon = async () => {
        try {
            const url = context
                ? `/api/marketing/coupon/promotion?context=${context}`
                : '/api/marketing/coupon/promotion';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPromoCoupon(data);
            }
        } catch (error) {
            console.error("Failed to fetch promo coupon:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/marketing/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('failProcess'));
            }

            setIsSuccess(true);
            await fetchPromoCoupon();
            if (onSubscribe) onSubscribe(email);
            toast.success("Subscribed successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('failProcess'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="mt-4 p-4 bg-lime-500/10 border border-lime-500/20 rounded-lg cursor-pointer hover:bg-lime-500/20 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4 text-black" />
                        </div>
                        <div>
                            <div className="font-medium text-white group-hover:text-lime-400 transition-colors">{t('wantDiscount')}</div>
                            <div className="text-xs text-zinc-400">{t('subscribeSecret')}</div>
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-lime-500 hover:text-lime-400">
                        {t('getCoupon')}
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
                {isSuccess ? (
                    <div className="py-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl mb-2">{t('onList')}</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                {t.rich('useCode', {
                                    code: promoCoupon?.code || "WELCOME10",
                                    discount: () => promoCoupon
                                        ? (promoCoupon.discountType === 'percentage' ? `${promoCoupon.discountValue}%` : <PriceDisplay amount={promoCoupon.discountValue} />)
                                        : "10%"
                                })}
                            </DialogDescription>
                        </div>
                        <Button onClick={() => setIsOpen(false)} className="bg-brand-yellow text-black hover:bg-brand-yellow/80">
                            {t('gotIt')}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{t('unlockBonus')}</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                {t('newsletterDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-zinc-400">{t('nameLabel')}</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black/50 border-white/10 text-white"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-zinc-400">{t('emailLabel')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/50 border-white/10 text-white"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-yellow/80 w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t('subscribeReveal')}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
