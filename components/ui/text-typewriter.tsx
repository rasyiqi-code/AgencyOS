"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/shared/utils";

interface TextTypewriterProps {
    text: string;
    className?: string;
    speed?: number;
    delay?: number;
    cursor?: boolean;
}

export function TextTypewriter({
    text,
    className,
    speed = 50,
    delay = 0,
    cursor = true
}: TextTypewriterProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!isTyping) return;

        if (displayedText.length < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [displayedText, isTyping, text, speed]);

    return (
        <span className={cn("inline-block", className)}>
            {displayedText}
            {cursor && (
                <span className="animate-pulse ml-1 inline-block bg-current w-[2px] h-[1em] align-middle" />
            )}
        </span>
    );
}
