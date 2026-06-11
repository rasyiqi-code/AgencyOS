"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useUser } from "@hexclave/next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PurchaseButtonProps {
    serviceId: string;
    interval: string;
    className?: string;
    customLabel?: string;
    selectedAddons?: Record<string, unknown>[];
}

/**
 * Tombol pembelian langsung untuk layanan (catalog service).
 * Menginisialisasi checkout langsung ke halaman checkout jika user sudah login,
 * atau menyimpan state pembelian tertunda dan mengarahkan ke halaman login jika belum.
 */
export function PurchaseButton({ serviceId, interval, className, customLabel }: PurchaseButtonProps) {
    const t = useTranslations("Cards");
    const locale = useLocale();
    const router = useRouter();
    const user = useUser();
    const [loading, setLoading] = useState(false);

    const label = customLabel
        ? customLabel
        : interval === "one_time"
            ? t("purchasePackage")
            : t("purchasePlan");

    const handlePurchase = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        // Jika user belum login, simpan detail service di sessionStorage dan arahkan ke login
        if (!user) {
            sessionStorage.setItem("pendingServiceCheckout", serviceId);
            // Klien akan dikembalikan ke halaman services dengan query action=checkout untuk memicu proses checkout setelah login
            const returnUrl = `/${locale}/services?action=checkout`;
            router.push(`/handler/sign-in?after_auth_return_to=${encodeURIComponent(returnUrl)}`);
            return;
        }

        // Jika user sudah login, inisialisasi order via API
        setLoading(true);
        try {
            const res = await fetch("/api/estimates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ serviceId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal membuat order");
            }

            if (data.id) {
                // Redirect langsung ke halaman checkout
                router.push(`/checkout/${data.id}`);
            } else {
                throw new Error("Respon API tidak memiliki ID estimasi");
            }
        } catch (error) {
            console.error("Purchase error:", error);
            toast.error(error instanceof Error ? error.message : "Gagal memproses pembelian");
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-11 text-sm rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${className}`}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
            <span>{label}</span>
        </Button>
    );
}

