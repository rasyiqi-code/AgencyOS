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
import { Loader2, CreditCard } from "lucide-react";
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

export function CheckoutForm({ product, userId, userEmail, appliedCoupon, amount }: {
    product: Product;
    userId?: string;
    userEmail?: string;
    appliedCoupon?: Coupon | null;
    amount?: number;
}) {
    const t = useTranslations("Checkout");
    const ti = useTranslations("Invoice");
    const [loading, setLoading] = useState(false);
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
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-yellow to-lime-500" />
            <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-brand-yellow/10 rounded-lg flex items-center justify-center border border-brand-yellow/20">
                        <CreditCard className="w-4 h-4 text-brand-yellow" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Agency OS Checkout</span>
                </div>
                <div>
                    <CardTitle className="text-2xl text-white">{t('finishPayment')}</CardTitle>
                    <CardDescription className="text-zinc-400">
                        {t('willBuy')} <span className="text-zinc-200 font-medium">{product.name}</span>
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {/* Info Produk */}
                    <div className="bg-zinc-900 p-4 rounded-lg flex justify-between items-center border border-zinc-800">
                        <div>
                            <div className="font-semibold text-white">{product.name}</div>
                            <div className="text-sm text-zinc-400 capitalize">
                                {product.purchaseType === "subscription"
                                    ? `Subscription / ${product.interval || "month"}`
                                    : `${ti('oneTime')} ${ti('license')}`}
                            </div>
                        </div>
                        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-yellow to-white">
                            <PriceDisplay amount={amount ?? product.price} />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label>{t('emailLabel')}</Label>
                        <Input
                            {...form.register("email")}
                            placeholder="email@example.com"
                            className="bg-zinc-900 border-zinc-800 focus:ring-brand-yellow/50"
                            disabled={!!userEmail}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Nama (opsional) */}
                    <div className="space-y-2">
                        <Label>{t('nameLabel')}</Label>
                        <Input
                            {...form.register("name")}
                            placeholder={t('namePlaceholder')}
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-semibold"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('payButton')} <PriceDisplay amount={amount ?? product.price} />
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
