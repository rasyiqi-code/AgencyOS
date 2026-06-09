"use client";

import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/shared/utils";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    fallbackClassName?: string;
}

/**
 * Komponen gambar aman yang secara otomatis beralih ke placeholder
 * jika pemuatan gambar dari sumber asli (misalnya penyimpanan R2) gagal.
 */
export function SafeImage({ alt, src, className, fallbackClassName, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className={cn("flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs", className, fallbackClassName)}>
                Gambar gagal dimuat
            </div>
        );
    }

    return (
        <img
            {...props}
            src={src}
            alt={alt}
            className={className}
            onError={() => {
                console.warn("Gagal memuat gambar, beralih ke fallback:", src);
                setError(true);
            }}
        />
    );
}
