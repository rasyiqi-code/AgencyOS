"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet, MessageCircle, Send, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";
import { MotionConfig, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DashboardLanguageSwitcher } from "@/components/dashboard/header/currency-switcher";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ViewDesignClientProps {
    slug: string;
    title: string;
    agencyName: string;
    html: string;
    externalUrl?: string;
    contactPhone?: string;
    contactTelegram?: string;
    logoUrl?: string;
    logoDisplayMode?: string;
}

const PREVIEW_HIDE_SCROLLBAR = `<style>body { scrollbar-width: none; -ms-overflow-style: none; } body::-webkit-scrollbar { display: none; }</style>`;

function buildSrcDoc(content: string): string {
    if (!content) return "<html><body style='background: #f8fafc'></body></html>";
    const trimmed = content.trim();
    const isFullDocument = /^<!doctype\s+html|^<html[\s>]/i.test(trimmed);
    if (isFullDocument) {
        if (/<head[\s>]/i.test(trimmed)) {
            return trimmed.replace(/<head([^>]*)>/i, `<head$1>${PREVIEW_HIDE_SCROLLBAR}`);
        }
        return trimmed.replace(/<html([^>]*)>/i, `<html$1><head>${PREVIEW_HIDE_SCROLLBAR}</head>`);
    }
    return `<html><head>${PREVIEW_HIDE_SCROLLBAR}</head><body>${content}</body></html>`;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function ViewDesignClient({ 
    slug, 
    title, 
    agencyName, 
    html, 
    externalUrl, 
    contactPhone, 
    contactTelegram,
    logoUrl,
    logoDisplayMode = "both"
}: ViewDesignClientProps) {
    const [device, setDevice] = useState<DeviceType>("desktop");
    const t = useTranslations("ViewDesign");

    const waLink = contactPhone
        ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}?text=Halo ${agencyName}, saya tertarik dengan desain ${title} (${slug}). Bisa bantu jelaskan lebih lanjut?`
        : null;

    const teleLink = contactTelegram
        ? `https://t.me/${contactTelegram.replace("@", "")}`
        : null;

    return (
        <div className="h-screen flex flex-col bg-[#111] overflow-hidden">
            {/* Premium Preview Header */}
            <header className="h-14 md:h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-50 shadow-2xl">
                <div className="flex items-center gap-3">
                    <Link href="/portfolio">
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="hidden sm:block h-8 w-px bg-white/5" />
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* 1. Logo Image (Conditional) */}
                        {(logoDisplayMode === "logo" || logoDisplayMode === "both") && (
                            logoUrl ? (
                                <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                                    <Image
                                        src={logoUrl}
                                        alt={agencyName}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            ) : (
                                /* Default stylized logo (Yellow check in gray circle) */
                                <div className="w-8 h-8 md:w-9 md:h-9 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                                    <Check className="w-5 h-5 text-brand-yellow stroke-[4px]" />
                                </div>
                            )
                        )}
                        
                        {/* 2. Agency Name & Title */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                                {/* Agency Name only if NOT in logo-only mode */}
                                {logoDisplayMode !== "logo" && (
                                    <>
                                        {agencyName}
                                        <div className="w-1 h-1 rounded-full bg-brand-yellow shrink-0" />
                                    </>
                                )}
                                
                                {/* Logo-only mode with divider if logo exists */}
                                {logoDisplayMode === "logo" && logoUrl && (
                                    <div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />
                                )}

                                <span className="text-zinc-500 font-medium truncate max-w-[120px] md:max-w-none">
                                    {title}
                                </span>
                            </h1>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter hidden md:block leading-none mt-0.5">
                                {logoDisplayMode === "logo" ? "Live Preview" : "Previewing Live Design System"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Device Switcher - ThemeForest Inspired */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/5 shadow-inner">
                    <button
                        onClick={() => setDevice("desktop")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-medium",
                            device === "desktop" ? "bg-white/10 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        Desktop
                    </button>
                    <button
                        onClick={() => setDevice("tablet")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-medium",
                            device === "tablet" ? "bg-white/10 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Tablet className="w-3.5 h-3.5" />
                        Tablet
                    </button>
                    <button
                        onClick={() => setDevice("mobile")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-medium",
                            device === "mobile" ? "bg-white/10 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                        Mobile
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex items-center">
                        <DashboardLanguageSwitcher />
                    </div>
                    {externalUrl && (
                        <Button asChild variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl">
                            <Link href={externalUrl} target="_blank" title="Remove Frame">
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </Button>
                    )}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-yellow text-black hover:bg-white transition-colors duration-300 font-bold rounded-xl px-5 h-9 md:h-10 text-xs shadow-lg shadow-brand-yellow/10">
                                {t("inquireDesign")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md p-8 rounded-3xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-yellow to-transparent opacity-50" />
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic tracking-tighter text-white uppercase italic">
                                    Ready to Build?
                                </DialogTitle>
                                <DialogDescription className="text-zinc-400 text-sm mt-2 leading-relaxed">
                                    Contact us to start your project with this design or get a custom one.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-3 mt-6">
                                {waLink && (
                                    <Button asChild className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold h-12 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                        <Link href={waLink} target="_blank">
                                            <MessageCircle className="w-5 h-5 mr-3" />
                                            WhatsApp Sales
                                        </Link>
                                    </Button>
                                )}

                                {teleLink && (
                                    <Button asChild variant="outline" className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white h-12 rounded-2xl">
                                        <Link href={teleLink} target="_blank">
                                            <Send className="w-5 h-5 mr-3 text-sky-400" />
                                            Telegram
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Design Preview Area with Managed Aspect Ratio & Frame */}
            <main className="flex-1 relative bg-[#0a0a0a] flex flex-col items-center p-4 md:p-8 overflow-hidden">
                <MotionConfig transition={{ type: "spring", stiffness: 120, damping: 20 }}>
                    <div className="flex-1 w-full max-w-7xl flex flex-col items-center h-full relative">
                        {/* Device Info (Dynamic) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 hidden lg:flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]"
                        >
                            <span>Resolution: {device === "mobile" ? "375 x 812" : device === "tablet" ? "768 x 1024" : "FullScreen"}</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span>Status: Interactive</span>
                        </motion.div>

                        <motion.div
                            animate={{
                                width: device === "mobile" ? 375 : device === "tablet" ? 768 : "100%",
                                height: "100%",
                                borderRadius: device === "desktop" ? "0px" : "40px",
                                padding: device === "desktop" ? "0px" : "12px",
                            }}
                            className={cn(
                                "bg-zinc-950 shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 relative group mx-auto",
                                device !== "desktop" && "border-[12px] border-zinc-800 shadow-2xl ring-1 ring-white/10"
                            )}
                        >
                            {/* Realistic Smartphone elements */}
                            {device === "mobile" && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center">
                                    <div className="w-10 h-1 rounded-full bg-zinc-900" />
                                </div>
                            )}

                            {/* The Design Iframe */}
                            <iframe
                                srcDoc={buildSrcDoc(html)}
                                className="w-full h-full border-0 bg-white"
                                title={`${title} Preview`}
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            />
                        </motion.div>
                    </div>
                </MotionConfig>
            </main>
        </div>
    );
}
