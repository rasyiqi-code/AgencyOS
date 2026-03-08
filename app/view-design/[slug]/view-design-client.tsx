"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet, MessageCircle, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    externalUrl?: string;
    contactPhone?: string;
    contactTelegram?: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function ViewDesignClient({ slug, title, agencyName, externalUrl, contactPhone, contactTelegram }: ViewDesignClientProps) {
    const [device, setDevice] = useState<DeviceType>("desktop");
    const t = useTranslations("ViewDesign");

    const waLink = contactPhone
        ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}?text=Halo ${agencyName}, saya tertarik dengan desain ${title} (${slug}). Bisa bantu jelaskan lebih lanjut?`
        : null;

    const teleLink = contactTelegram
        ? `https://t.me/${contactTelegram.replace("@", "")}`
        : null;

    return (
        <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
            {/* Branding Frame / Header */}
            <header className="h-12 md:h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-3 md:px-6 shrink-0 relative z-50">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <Link href="/portfolio">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 md:w-10 md:h-10 shrink-0">
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </Link>
                    <div className="hidden md:block h-6 w-px bg-white/10 mx-1" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs md:text-sm font-bold text-white tracking-tight flex items-center gap-2 truncate">
                            <span className="truncate">{agencyName}</span>
                            <Badge variant="outline" className="text-[8px] md:text-[10px] h-4 md:h-5 px-1 md:px-1.5 border-brand-yellow/30 text-brand-yellow bg-brand-yellow/5 shrink-0">
                                {t("previewMode")}
                            </Badge>
                        </span>
                        <span className="text-[10px] md:text-xs text-zinc-500 truncate">{title}</span>
                    </div>
                </div>

                {/* Device Toggles */}
                <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setDevice("desktop")}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            device === "desktop" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDevice("tablet")}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            device === "tablet" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                        title="Tablet View"
                    >
                        <Tablet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDevice("mobile")}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            device === "mobile" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 md:gap-3 shrink-0">
                    <div className="flex items-center scale-90 md:scale-100 origin-right transition-all">
                        <DashboardLanguageSwitcher />
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold rounded-full text-[10px] md:text-xs px-3 md:px-4 h-7 md:h-8">
                                <span className="hidden sm:inline">{t("inquireDesign")}</span>
                                <span className="sm:hidden">{t("inquireShort")}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-white/10 text-white w-screen h-screen sm:h-auto sm:max-w-md flex flex-col justify-center sm:justify-start p-6 md:p-8">
                            <DialogHeader className="sm:text-left">
                                <DialogTitle className="text-2xl sm:text-xl font-bold bg-gradient-to-r from-brand-yellow to-yellow-500 bg-clip-text text-transparent">
                                    {t("modalTitle")}
                                </DialogTitle>
                                <DialogDescription className="text-zinc-400 text-base sm:text-sm mt-4 sm:mt-2 leading-relaxed">
                                    {t("modalDescription")}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-3 mt-4">
                                {waLink && (
                                    <Button asChild className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold h-11">
                                        <Link href={waLink} target="_blank">
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            {t("whatsappCTA")}
                                        </Link>
                                    </Button>
                                )}

                                {teleLink && (
                                    <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white h-11">
                                        <Link href={teleLink} target="_blank">
                                            <Send className="w-5 h-5 mr-2 text-sky-400" />
                                            {t("telegramCTA")}
                                        </Link>
                                    </Button>
                                )}

                                <Button asChild variant="ghost" className="w-full text-zinc-400 hover:text-white hover:bg-white/5 h-11">
                                    <Link href={`/contact?ref=${slug}`}>
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {t("contactFormCTA")}
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                    {t("modalFooter")}
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Design Preview Area */}
            <main className="flex-1 relative bg-zinc-900/50 flex items-center justify-center p-4 overflow-hidden">
                <MotionConfig transition={{ type: "spring", stiffness: 200, damping: 25 }}>
                    <motion.div
                        animate={{
                            width: device === "mobile" ? 375 : device === "tablet" ? 768 : "100%",
                            height: "100%",
                        }}
                        className="bg-white shadow-2xl overflow-hidden border border-white/10 relative group mx-auto transition-all"
                        style={{
                            maxWidth: "100%",
                            borderRadius: device === "desktop" ? "0.5rem" : "1.5rem", // More rounded for mobile/tablet
                        }}
                    >
                        {/* The Design Iframe */}
                        <iframe
                            src={externalUrl || `/api/view-design/${slug}`}
                            className="w-full h-full border-0 bg-white"
                            title={`${title} Preview`}
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        />
                    </motion.div>
                </MotionConfig>
            </main>
        </div>
    );
}
