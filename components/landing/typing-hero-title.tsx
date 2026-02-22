"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface TypingHeroTitleProps {
    prefix: string;
    targets: string[];
}

export function TypingHeroTitle({ prefix, targets }: TypingHeroTitleProps) {
    const [targetIndex, setTargetIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    // Memoize targets to fix react-hooks/exhaustive-deps
    const safeTargets = useMemo(() =>
        targets && targets.length > 0 ? targets : ["Solutions"],
        [targets]);

    useEffect(() => {
        const currentTarget = safeTargets[targetIndex];
        if (!currentTarget) return;

        const handleTyping = () => {
            if (!isDeleting) {
                setDisplayText(currentTarget.slice(0, displayText.length + 1));
                setTypingSpeed(150);

                if (displayText === currentTarget) {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                setDisplayText(currentTarget.slice(0, displayText.length - 1));
                setTypingSpeed(100);

                if (displayText === "") {
                    setIsDeleting(false);
                    setTargetIndex((targetIndex + 1) % safeTargets.length);
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, targetIndex, safeTargets, typingSpeed]);

    return (
        <div className="flex flex-row items-center justify-center lg:justify-start gap-x-2 md:gap-x-4 whitespace-nowrap">
            <span className="text-white shrink-0">{prefix}</span>
            <span className="relative inline-flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow animate-gradient-x bg-[length:200%_auto]">
                    {displayText}
                </span>
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block w-[4px] h-[0.9em] bg-brand-yellow ml-2"
                />
            </span>
        </div>
    );
}
