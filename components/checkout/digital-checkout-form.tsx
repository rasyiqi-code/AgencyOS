"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Tag, Check } from "lucide-react";
import "@/types/payment"; // Window.snap type augmentation
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface Product {
    id: string;
    name: string;
    price: number;
    purchaseType: string;
    interval?: string;
}

import { Coupon } from "@/lib/shared/types";

type CheckoutFormValues = z.infer<z.ZodObject<{ email: z.ZodString; name: z.ZodOptional<z.ZodString> }>>;

export function CheckoutForm({ product, userId, userEmail, appliedCoupon, onApplyCoupon, amount, activeRate }: {
    product: Product;
    userId?: string;
    userEmail?: string;
    appliedCoupon?: Coupon | null;
    onApplyCoupon: (coupon: Coupon | null) => void;
    amount?: number;
    activeRate?: number;
}) {
    const t = useTranslations("Checkout");
    const ti = useTranslations("Invoice");
    const [loading, setLoading] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
    const router = useRouter();

    // Read affiliate cookie on mount
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )agencyos_affiliate_id=([^;]+)'));
            if (match) {
                setAffiliateCode(match[2]);
            }
        }
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        try {
            const response = await fetch('/api/marketing/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput, context: 'DIGITAL_PRODUCT' }) // Assuming DIGITAL_PRODUCT context
            });

            const result = await response.json();

            if (result.valid) {
                onApplyCoupon((result.coupon as Coupon) || null);
                toast.success(t("couponApplied"));
            } else {
                toast.error(result.message || t("invalidCoupon"));
                onApplyCoupon(null);
            }
        } catch {
            toast.error(t("validateError"));
        } finally {
            setIsValidating(false);
        }
    };

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(z.object({
            email: z.string().email(t('validEmail')),
            name: z.string().optional(),
        })),
        defaultValues: {
            email: userEmail || "",
            name: "",
        },
    });

    const onSubmit = async (data: CheckoutFormValues) => {
        setLoading(true);
        try {
            // 1. Request Snap token dari API
            const res = await fetch("/api/digital-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    email: data.email,
                    name: data.name,
                    userId: userId,
                    affiliateCode: affiliateCode,
                    couponCode: appliedCoupon?.code,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || t('failProcess'));
            }

            // 2. Redirect ke halaman invoice digital untuk pembayaran
            if (result.redirectUrl) {
                toast.success(t('orderCreated'));
                router.push(result.redirectUrl);
            } else {
                throw new Error(t('failRedirect'));
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Error";
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-white/10 bg-zinc-900 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-yellow to-lime-500" />
            <CardHeader className="space-y-4 pt-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-brand-yellow/10 rounded-lg flex items-center justify-center border border-brand-yellow/20">
                        <CreditCard className="w-4 h-4 text-brand-yellow" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Agency OS Checkout</span>
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-white">{t('finishPayment')}</CardTitle>
                    <CardDescription className="text-zinc-400">
                        {t('willBuy')} <span className="text-zinc-200 font-medium">{product.name}</span>
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 pb-8">
                    {/* Info Produk */}
                    <div className="bg-zinc-800/50 p-6 rounded-xl border border-white/5 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="font-bold text-white text-xl leading-tight">{product.name}</div>
                                <div className="text-sm text-zinc-500 capitalize">
                                    {product.purchaseType === "subscription"
                                        ? `Subscription / ${product.interval || "month"}`
                                        : `${ti('oneTime')} ${ti('license')}`}
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight pt-3 border-t border-white/5">
                                <PriceDisplay amount={amount ?? product.price} />
                            </div>
                        </div>

                        {/* Currency Rate Info */}
                        <p className="text-[10px] text-zinc-500 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 opacity-60">
                            <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                            {t("processedIn")} IDR {activeRate && (
                                `(rate: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(activeRate)})`
                            )}
                        </p>
                    </div>

                    {/* Kupon */}
                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-white">
                            <Tag className="w-3.5 h-3.5 text-brand-yellow" />
                            <span className="font-medium text-[10px] uppercase tracking-wider text-zinc-400">{t("haveCoupon")}</span>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder={t("enterCode")}
                                className="h-10 bg-zinc-950/50 border-zinc-800 text-white focus:ring-brand-yellow/50 uppercase text-xs"
                                disabled={!!appliedCoupon}
                            />
                            {appliedCoupon ? (
                                <Button
                                    variant="secondary"
                                    type="button"
                                    size="sm"
                                    className="bg-white/5 hover:bg-white/10 text-white h-10 px-4 text-xs"
                                    onClick={() => {
                                        setCouponInput("");
                                        onApplyCoupon(null);
                                    }}
                                >
                                    {t("change")}
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    type="button"
                                    className="bg-brand-yellow text-black hover:bg-brand-yellow/80 h-10 px-4 font-bold text-xs"
                                    onClick={handleApplyCoupon}
                                    disabled={isValidating || !couponInput}
                                >
                                    {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("apply")}
                                </Button>
                            )}
                        </div>
                        {appliedCoupon && (
                            <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                <Check className="w-3 h-3" />
                                {t("applied")}: {appliedCoupon.code}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400 font-medium text-sm">{t('emailLabel')}</Label>
                        <Input
                            {...form.register("email")}
                            placeholder="email@example.com"
                            className="h-12 bg-zinc-900 border-white/10 focus:ring-brand-yellow/50 text-white placeholder:text-zinc-600"
                            disabled={!!userEmail}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Nama (opsional) */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400 font-medium text-sm">{t('nameLabel')}</Label>
                        <Input
                            {...form.register("name")}
                            placeholder={t('namePlaceholder')}
                            className="h-12 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600"
                        />
                    </div>
                </CardContent>
                <CardFooter className="pb-8">
                    <div className="w-full space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('payButton')} <PriceDisplay amount={amount ?? product.price} />
                        </Button>

                        <p className="text-center text-[10px] text-zinc-500 opacity-60">
                            Aman dengan enkripsi SSL 256-bit.
                        </p>
                    </div>
                </CardFooter>
            </form>
        </Card >
    );
}
