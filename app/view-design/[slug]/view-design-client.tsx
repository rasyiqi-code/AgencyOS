"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/shared/utils";
import { MotionConfig, motion } from "framer-motion";

interface ViewDesignClientProps {
    slug: string;
    title: string;
    agencyName: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function ViewDesignClient({ slug, title, agencyName }: ViewDesignClientProps) {
    const [device, setDevice] = useState<DeviceType>("desktop");

    return (
        <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
            {/* Branding Frame / Header */}
            <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-50">
                <div className="flex items-center gap-4">
                    <Link href="/portfolio">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            {agencyName}
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-brand-yellow/30 text-brand-yellow bg-brand-yellow/5">
                                PREVIEW MODE
                            </Badge>
                        </span>
                        <span className="text-xs text-zinc-500">{title}</span>
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

                <div className="flex items-center gap-3">
                    <Link href={`/contact?ref=${slug}`}>
                        <Button size="sm" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold rounded-full text-xs px-4">
                            Inquire Design
                        </Button>
                    </Link>
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
                            src={`/api/view-design/${slug}`}
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
