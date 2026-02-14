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

interface Product {
    id: string;
    name: string;
    price: number;
    purchaseType: string;
    interval?: string;
}

const checkoutSchema = z.object({
    email: z.string().email("Masukkan email yang valid"),
    name: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/**
 * Checkout Form untuk pembelian produk digital via Midtrans Snap.
 *
 * Flow:
 * 1. User isi form (email + nama)
 * 2. Submit → POST /api/digital-checkout → dapat snapToken
 * 3. Open Midtrans Snap popup via window.snap.pay(token)
 * 4. Midtrans kirim webhook ke /api/payment/midtrans/webhook
 * 5. Webhook update DigitalOrder status + generate license
 * 6. User redirect ke dashboard/products
 */
export function CheckoutForm({ product, userId, userEmail }: {
    product: Product;
    userId?: string;
    userEmail?: string;
}) {
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
        resolver: zodResolver(checkoutSchema),
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
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Gagal memproses checkout");
            }

            // 2. Redirect ke halaman invoice digital untuk pembayaran
            if (result.redirectUrl) {
                toast.success("Order berhasil dibuat. Mengarahkan ke pembayaran...");
                router.push(result.redirectUrl);
            } else {
                throw new Error("Gagal mendapatkan URL redirect invoice.");
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan";
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
                    <CardTitle className="text-2xl text-white">Selesaikan Pembayaran</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Anda akan membeli <span className="text-zinc-200 font-medium">{product.name}</span>
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
                                    : "One-time purchase"}
                            </div>
                        </div>
                        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-yellow to-white">
                            ${product.price}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label>Alamat Email</Label>
                        <Input
                            {...form.register("email")}
                            placeholder="email@contoh.com"
                            className="bg-zinc-900 border-zinc-800 focus:ring-brand-yellow/50"
                            disabled={!!userEmail}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Nama (opsional) */}
                    <div className="space-y-2">
                        <Label>Nama (Opsional)</Label>
                        <Input
                            {...form.register("name")}
                            placeholder="Nama Anda"
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
                        Bayar ${product.price}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
