"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingHeroTitleProps {
    prefix: string;
    targets: string[];
    mode?: "typing" | "rapid";
    isPaused?: boolean; // Prop baru untuk mengontrol mode rapid dari luar
    onStateChange?: (state: "typing" | "full" | "deleting") => void;
}

/**
 * TypingHeroTitle: Mendukung efek typing tradisional atau switch cepat (rapid).
 */
export function TypingHeroTitle({ prefix, targets, mode = "typing", isPaused, onStateChange }: TypingHeroTitleProps) {
    const [targetIndex, setTargetIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const safeTargets = useMemo(() =>
        targets && targets.length > 0 ? targets : ["Solutions"],
        [targets]);

    // Effect untuk mode "rapid" - Dikontrol oleh isPaused jika ada
    useEffect(() => {
        if (mode !== "rapid" || isPaused) return;
        
        const interval = setInterval(() => {
            setTargetIndex((prev) => (prev + 1) % safeTargets.length);
        }, 600); // Sesuai pilihan user terakhir
        return () => clearInterval(interval);
    }, [safeTargets.length, mode, isPaused]);

    // Effect untuk mode "typing"
    useEffect(() => {
        if (mode !== "typing") return;
        
        const currentTarget = safeTargets[targetIndex];
        if (!currentTarget) return;

        const handleTyping = () => {
            if (!isDeleting) {
                if (displayText === currentTarget) {
                    onStateChange?.("full");
                    // Pause selama 1800ms (3 x 600ms) agar baris bawah sempat ganti 3 kali
                    setTimeout(() => setIsDeleting(true), 1800);
                } else {
                    onStateChange?.("typing");
                    setDisplayText(currentTarget.slice(0, displayText.length + 1));
                    setTypingSpeed(100);
                }
            } else {
                onStateChange?.("deleting");
                setDisplayText(currentTarget.slice(0, displayText.length - 1));
                setTypingSpeed(50);

                if (displayText === "") {
                    setIsDeleting(false);
                    setTargetIndex((targetIndex + 1) % safeTargets.length);
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, targetIndex, safeTargets, typingSpeed, mode, onStateChange]);

    return (
        <div className="flex flex-row items-center justify-center lg:justify-start gap-x-2 md:gap-x-4 whitespace-nowrap overflow-visible">
            <span className="text-white shrink-0">{prefix}</span>
            <div className="relative inline-flex items-center h-[1.2em]">
                {mode === "rapid" ? (
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={targetIndex}
                            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow animate-gradient-x bg-[length:200%_auto] block"
                        >
                            {safeTargets[targetIndex]}
                        </motion.span>
                    </AnimatePresence>
                ) : (
                    <span className="relative inline-flex items-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow animate-gradient-x bg-[length:200%_auto]">
                            {displayText}
                        </span>
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-block w-[3px] h-[0.8em] bg-brand-yellow ml-1.5"
                        />
                    </span>
                )}
            </div>
        </div>
    );
}
