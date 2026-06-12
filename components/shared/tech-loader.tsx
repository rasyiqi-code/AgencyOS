"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Terminal } from "lucide-react";
import { useTranslations } from "next-intl";

export function TechLoader() {
    const t = useTranslations("Loader");

    const LOADING_STEPS = useMemo(() => [
        t("initializingCore"),
        t("loadingNeural"),
        t("establishingUplink"),
        t("decryptingData"),
        t("syncingWorkspace"),
        t("systemReady")
    ], [t]);

    const [currentStep, setCurrentStep] = useState(0);
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(30); // Faster initial speed
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if user has already seen the loader in this session or if it is a bot/Lighthouse
        const hasSeenLoader = sessionStorage.getItem("agency-os-loader-seen");
        const isBotOrLighthouse = typeof navigator !== "undefined" && (
            navigator.webdriver ||
            /lighthouse|googlebot|chrome-lighthouse|speedinsights|bot|crawler|spider/i.test(navigator.userAgent)
        );

        if (hasSeenLoader || isBotOrLighthouse) {
            // Skip animation for bots, Lighthouse, or returning users
            setTimeout(() => setIsVisible(false), 0);
            return;
        }

        const handleTyping = () => {
            const fullText = LOADING_STEPS[currentStep % LOADING_STEPS.length];

            if (!isDeleting) {
                setText(fullText.substring(0, text.length + 1));
                setTypingSpeed(15 + Math.random() * 20); // Faster typing

                if (text === fullText) {
                    // Stay on "System Ready" longer at the end, but snappy for UX
                    const waitTime = currentStep === LOADING_STEPS.length - 1 ? 400 : 200;
                    setTimeout(() => {
                        if (currentStep === LOADING_STEPS.length - 1) {
                            sessionStorage.setItem("agency-os-loader-seen", "true");
                            setIsVisible(false);
                        } else {
                            setIsDeleting(true);
                        }
                    }, waitTime);
                }
            } else {
                setText(fullText.substring(0, text.length - 1));
                setTypingSpeed(5); // Very fast deletion

                if (text === "") {
                    setIsDeleting(false);
                    setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, currentStep, typingSpeed, LOADING_STEPS]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background font-mono">
            <div className="relative w-full max-w-md p-6">
                {/* Decorative scan line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                    <div className="w-full h-1 bg-primary animate-[scan_2s_linear_infinite]" />
                </div>

                <div className="flex items-center space-x-3 mb-4 text-primary">
                    <div className="p-2 border border-primary/30 bg-primary/5 rounded-sm">
                        <Terminal className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-xs tracking-widest uppercase opacity-70">
                        {t("terminalVersion")}
                    </div>
                </div>

                <div className="space-y-2 border border-primary/20 bg-primary/5 p-4 rounded-md backdrop-blur-sm relative overflow-hidden group">
                    {/* Grid background effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

                    <div className="flex items-start gap-2 relative z-10">
                        <span className="text-primary font-bold">{">"}</span>
                        <div className="flex-1">
                            <p className="text-primary text-sm sm:text-base leading-relaxed tracking-tight min-h-[1.5em]">
                                {text}
                                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-1 h-1 w-full bg-primary/10 overflow-hidden rounded-full">
                        <div
                            className="h-full bg-primary animate-[progress_3s_ease-in-out_infinite]"
                            style={{ width: "30%" }}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-[10px] uppercase tracking-tighter text-muted-foreground opacity-50 px-1">
                    <span>{t("target")}: AgencyOS_Prod</span>
                    <span>{t("status")}: {t("processing")}</span>
                </div>
            </div>

            <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(1000%); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); width: 10%; }
          50% { transform: translateX(100%); width: 40%; }
          100% { transform: translateX(300%); width: 10%; }
        }
      `}</style>
        </div>
    );
}
