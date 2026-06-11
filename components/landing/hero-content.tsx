"use client";

import React from "react";
import { motion, Variants, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { TypingHeroTitle } from "./typing-hero-title";
import { useParams } from "next/navigation";
import { cn } from "@/lib/shared/utils";

interface HeroContentProps {
    agencyName: string;
}

export function HeroContent({ agencyName }: HeroContentProps) {
    const t = useTranslations("Hero");
    const params = useParams();
    const locale = params?.locale as string || "id";
    const [isMobile, setIsMobile] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const shouldReduceMotion = !!useReducedMotion();
    
    // Batasi pengulangan maksimal 2 kali untuk mencegah pembebanan CPU terus-menerus di background
    const repeatCount = (isMobile || shouldReduceMotion) ? 0 : 2;

    React.useEffect(() => {
        setMounted(true);
        setIsMobile(window.innerWidth < 1024);
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: isMobile ? 0.05 : 0.15,
                delayChildren: isMobile ? 0.1 : 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
        }
    };

    const [typingStatus, setTypingStatus] = React.useState<"typing" | "full" | "deleting">("typing");

    return (
        <>
            <div className="absolute inset-0 bg-black">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1"
                    >
                        {/* Status Widget */}
                        <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
                            <Link href="/price-calculator">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-sm font-medium mb-4 hover:bg-brand-yellow/20 transition-colors cursor-pointer w-fit">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                                    </span>
                                    {t("statusBadge", { brand: agencyName })}
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="relative space-y-4"
                        >
                            <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                                <TypingHeroTitle
                                    prefix={t("title1")}
                                    targets={t.raw("typing.build")}
                                    mode="typing"
                                    onStateChange={setTypingStatus}
                                />
                            </h1>
                            <div className="text-2xl md:text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1] opacity-80">
                                <TypingHeroTitle
                                    prefix={t("forYour")}
                                    targets={t.raw("typing.audience")}
                                    mode="rapid"
                                    isPaused={typingStatus !== "full"}
                                />
                            </div>
                        </motion.div>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-zinc-400 leading-relaxed"
                        >
                            {t.rich("description", {
                                white: (chunks: React.ReactNode) => <span className="text-white font-semibold">{chunks}</span>,
                                brand: agencyName
                            })}
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col gap-4 pt-4"
                        >
                            <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-11 px-5 text-sm md:h-14 md:px-8 md:text-lg bg-brand-yellow text-black hover:bg-brand-yellow/90 rounded-full font-bold shadow-[0_0_20px_rgba(254,215,0,0.3)] hover:shadow-[0_0_35px_rgba(254,215,0,0.5)] transition-all cursor-pointer"
                                >
                                    <Link href={`/${locale}/contact`}>
                                        {t("launchDashboard")}
                                        <ArrowRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5" />
                                    </Link>
                                </Button>

                                <Link href="/services">
                                    <Button variant="outline" size="lg" className="h-11 px-5 text-sm md:h-14 md:px-8 md:text-lg bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-brand-yellow/10 hover:text-brand-yellow hover:border-brand-yellow/50 rounded-full transition-all backdrop-blur-sm">
                                        <Zap className="w-4 h-4 mr-1.5 text-brand-yellow" />
                                        {t("viewServices")}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Tech Stack Hints - Marquee */}
                        <motion.div
                            variants={itemVariants}
                            className="pt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 flex justify-center lg:justify-start w-full overflow-hidden"
                        >
                            <div className="relative flex overflow-x-hidden w-full max-w-[300px] lg:max-w-none [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
                                <motion.div
                                    className="flex whitespace-nowrap gap-8"
                                    animate={{ x: "-50%" }}
                                    transition={{
                                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                                        ease: "linear",
                                        duration: 20,
                                    }}
                                >
                                    {[...Array(4)].map((_, i) => (
                                        <span key={i} className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex-shrink-0">
                                            {t("poweredBy")}
                                        </span>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Expert Asset */}
                    <div className="relative mt-0 lg:mt-0 order-1 lg:order-2">


                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: isMobile ? 0.8 : 1.2,
                                ease: "easeOut"
                            }}
                            className="relative w-full h-[400px] sm:h-[550px] lg:h-[600px] xl:h-[700px] z-10 flex items-end justify-center"
                        >


                            {/* Business Visuals Masking Layer (Bottom) */}
                            {mounted && <BusinessVisuals isMobile={isMobile} repeatCount={repeatCount} shouldReduceMotion={shouldReduceMotion} />}

                            {/* Floating AI Model Badges - Background Layer (Middle) */}
                            <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-40">
                                {mounted && (
                                    <>
                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "top-[10%] left-[5%]" : "top-[20%] -left-12"}
                                            delay={1.2}
                                        >
                                            <BadgeContent
                                                icon="/brands/gemini.png"
                                                name="Google"
                                                model="Gemini 1.5 Pro"
                                            />
                                        </BadgeWrapper>

                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "top-[10%] right-[5%]" : "top-[15%] -right-8"}
                                            delay={1.4}
                                        >
                                            <BadgeContent
                                                icon="/brands/openai.png"
                                                name="OpenAI"
                                                model="GPT-4o"
                                            />
                                        </BadgeWrapper>

                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "bottom-[15%] left-[5%]" : "bottom-[20%] -left-8"}
                                            delay={1.6}
                                        >
                                            <BadgeContent
                                                icon="/brands/llama.png"
                                                name="Meta"
                                                model="Llama 3.1"
                                            />
                                        </BadgeWrapper>

                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "bottom-[10%] right-[5%]" : "bottom-[25%] -right-12"}
                                            delay={1.8}
                                        >
                                            <BadgeContent
                                                icon="/brands/claude.png"
                                                name="Anthropic"
                                                model="Claude 3.5 Sonnet"
                                            />
                                        </BadgeWrapper>
                                    </>
                                )}
                            </div>

                            <Image
                                src="/expert.png"
                                alt={t("heroImageAlt", { brand: agencyName })}
                                fill
                                className="object-contain object-bottom relative z-10"
                                priority
                                loading="eager"
                                decoding="sync"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                fetchPriority="high"
                            />

                            {/* Accent Tagline Layer (Top) */}
                            <div className="absolute bottom-12 left-0 w-full z-20 pointer-events-none px-4 flex flex-col items-center justify-center gap-0 text-center">
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{
                                        y: 0,
                                        opacity: [0.7, 1, 0.8, 1],
                                    }}
                                    transition={{
                                        y: { duration: 1.2, delay: 1.2 },
                                        opacity: { duration: 2, repeat: repeatCount, ease: "easeInOut" }
                                    }}
                                    className="text-xl md:text-3xl xl:text-4xl font-black italic tracking-tighter text-brand-yellow/80 drop-shadow-[0_0_10px_rgba(254,215,0,0.7)] drop-shadow-[0_0_20px_rgba(254,215,0,0.4)] leading-none"
                                >
                                {t("heroTagline1")}
                                </motion.p>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{
                                        y: 0,
                                        opacity: [0.7, 1, 0.8, 1],
                                    }}
                                    transition={{
                                        y: { duration: 1.2, delay: 1.4 },
                                        opacity: { duration: 2.5, repeat: repeatCount, ease: "easeInOut", delay: 0.2 }
                                    }}
                                    className="text-xl md:text-3xl xl:text-4xl font-black italic tracking-tighter text-brand-yellow/80 drop-shadow-[0_0_10px_rgba(254,215,0,0.7)] drop-shadow-[0_0_20px_rgba(254,215,0,0.4)] leading-none mt-2"
                                >
                                    {t("heroTagline2")}
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}

function BadgeWrapper({ children, delay, duration = 8, className, isMobile }: {
    children: React.ReactNode;
    delay: number;
    duration?: number;
    className?: string;
    isMobile: boolean;
}) {
    // Gunakan deteksi prefensi motion untuk serverless/client-side match
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: 1, 
                y: (isMobile || reduced) ? 0 : [0, -10, 0] 
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                y: { 
                    duration: duration, 
                    repeat: (isMobile || reduced) ? 0 : Infinity, 
                    ease: "easeInOut",
                    delay: delay
                }
            }}
            className={cn("absolute", className)}
        >
            {children}
        </motion.div>
    );
}

function BadgeContent({ name, model, icon }: {
    name: string;
    model: string;
    icon: string;
}) {
    return (
        <div className="flex items-center gap-1.5 group/badge">
            <div className="w-5 h-5 rounded-md overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500 bg-white/5 p-1 flex items-center justify-center">
                <Image 
                    src={icon} 
                    alt={`${name} logo`} 
                    width={16} 
                    height={16} 
                    className="object-contain" 
                    priority 
                />
            </div>
            <div>
                <div className="text-[7px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">{name}</div>
                <div className="text-[9px] font-bold text-white leading-none mt-0.5">{model}</div>
            </div>
        </div>
    );
}

const BusinessVisuals = ({ isMobile, repeatCount, shouldReduceMotion }: { 
    isMobile: boolean; 
    repeatCount: number; 
    shouldReduceMotion: boolean; 
}) => {

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            {/* Growth Graph SVG */}
            <svg
                viewBox="0 0 800 400"
                className="w-full h-full opacity-20"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="var(--brand-yellow)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--brand-yellow)" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Grid Lines - Optimized on Mobile (Static) */}
                {[...Array(6)].map((_, i) => (
                    <line
                        key={`grid-v-${i}`}
                        x1={i * 160}
                        y1="0"
                        x2={i * 160}
                        y2="400"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}
                {[...Array(4)].map((_, i) => (
                    <line
                        key={`grid-h-${i}`}
                        x1="0"
                        y1={i * 100}
                        x2="800"
                        y2={i * 100}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}

                {/* Growth Path - Slower/Disabled on Mobile to save CPU */}
                <motion.path
                    d="M 0 350 Q 150 330 300 250 T 600 150 T 800 50"
                    fill="none"
                    stroke="url(#growthGradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: isMobile ? 2 : 3,
                        ease: "easeInOut",
                        repeat: repeatCount,
                        repeatType: "loop",
                        repeatDelay: 1
                    }}
                />

                {/* Secondary Path - Optimized on Mobile (Static) */}
                <motion.path
                    d="M 0 380 Q 200 360 400 320 T 700 220 T 800 180"
                    fill="none"
                    stroke="rgba(254,215,0,0.1)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: isMobile ? 6 : 4,
                        ease: "easeInOut",
                        repeat: repeatCount,
                        repeatType: "loop"
                    }}
                />
            </svg>

            {/* Floating Business Icons/Nodes - Optimized on Mobile (Static) */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        y: (isMobile || shouldReduceMotion) ? 0 : [-10, 10, -10],
                        opacity: (isMobile || shouldReduceMotion) ? 0.15 : [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[20%] left-[10%] text-brand-yellow"
                >
                    <TrendingUp size={48} strokeWidth={1} />
                </motion.div>

                <motion.div
                    animate={{
                        y: (isMobile || shouldReduceMotion) ? 0 : [10, -10, 10],
                        opacity: (isMobile || shouldReduceMotion) ? 0.1 : [0.05, 0.2, 0.05]
                    }}
                    transition={{
                        duration: 6,
                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[30%] right-[15%] text-brand-yellow"
                >
                    <BarChart3 size={64} strokeWidth={1} />
                </motion.div>

                <motion.div
                    animate={{
                        scale: (isMobile || shouldReduceMotion) ? 1 : [1, 1.1, 1],
                        opacity: (isMobile || shouldReduceMotion) ? 0.15 : [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[40%] right-[10%] text-brand-yellow"
                >
                    <Activity size={40} strokeWidth={1} />
                </motion.div>
            </div>
        </div>
    );
};
