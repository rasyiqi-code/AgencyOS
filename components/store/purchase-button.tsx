"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface PurchaseButtonProps {
    serviceId: string;
    interval: string;
    className?: string;
    customLabel?: string;
    selectedAddons?: Record<string, unknown>[];
}

/**
 * Tombol CTA untuk service — mengarahkan user ke halaman price-calculator
 * dengan service yang dipilih sebagai pre-fill, karena digital agency
 * membutuhkan konsultasi dan estimasi harga sebelum checkout.
 */
export function PurchaseButton({ serviceId, interval, className, customLabel }: PurchaseButtonProps) {
    const t = useTranslations("Cards");
    const locale = useLocale();

    const label = customLabel
        ? customLabel
        : interval === "one_time"
            ? t("purchasePackage")
            : t("purchasePlan");

    return (
        <Button
            asChild
            className={`w-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold h-11 text-sm rounded-xl transition-transform active:scale-[0.98] ${className}`}
        >
            <Link href={`/${locale}/price-calculator?service=${serviceId}`}>
                {label}
            </Link>
        </Button>
    );
}
