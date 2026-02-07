
"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/shared/utils";

interface SafeImageProps extends ImageProps {
    fallbackClassName?: string;
}

export function SafeImage({ alt, src, className, fallbackClassName, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    if (error) {
        // Fallback to unoptimized standard img tag or unoptimized Next Image
        // We use Next Image with unoptimized=true to keep props consistency but bypass server optimization
        return (
            <Image
                {...props}
                src={src}
                alt={alt}
                className={cn(className, fallbackClassName)}
                unoptimized={true}
                onError={() => {
                    // If even the direct link fails, we could show a placeholder or keep it broken
                    console.error("Failed to load image even unoptimized:", src);
                }}
            />
        );
    }

    return (
        <Image
            {...props}
            src={src}
            alt={alt}
            className={className}
            onError={() => {
                console.warn("Image optimization failed, falling back to unoptimized:", src);
                setError(true);
            }}
        />
    );
}
