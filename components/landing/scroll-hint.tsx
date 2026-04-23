"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface ScrollHintProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "inverted";
}

export function ScrollHint({ children, className, variant = "default" }: ScrollHintProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleScroll = () => {
        if (scrollRef.current && scrollRef.current.scrollLeft > 10) {
            setShowHint(false);
        }
    };

    const hintStyles = {
        default: {
            bg: "bg-brand-yellow",
            text: "text-black",
            shadow: "shadow-[0_0_30px_rgba(254,215,0,0.4)]",
            border: "border-black"
        },
        inverted: {
            bg: "bg-black",
            text: "text-brand-yellow",
            shadow: "shadow-[0_0_30px_rgba(0,0,0,0.4)]",
            border: "border-brand-yellow"
        }
    };

    const style = hintStyles[variant];

    return (
        <div className="relative group/scroll-container w-full">
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className={cn(
                    "flex overflow-x-auto snap-x snap-mandatory no-scrollbar relative",
                    className
                )}
            >
                {children}
            </div>

            {/* Floating Swipe Hint (Mobile Only) */}
            <AnimatePresence>
                {isMobile && showHint && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none lg:hidden flex flex-col items-center gap-3"
                    >
                        <motion.div 
                            animate={{ x: [0, -10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center border-4",
                                style.bg,
                                style.text,
                                style.shadow,
                                style.border
                            )}
                        >
                            <ArrowRight className="w-7 h-7" />
                        </motion.div>
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow">Swipe</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
