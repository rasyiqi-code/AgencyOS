"use client";

import { useState } from "react";

interface LogoImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
}

export function LogoImage({ src, alt, width, height, className, priority }: LogoImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setImgSrc("/logo.png");
            setHasError(true);
        }
    };

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            unoptimized // Keep unoptimized to avoid Vercel edge function timeouts on external media
            onError={handleError}
            style={{ width: 'auto' }}
        />
    );
}
