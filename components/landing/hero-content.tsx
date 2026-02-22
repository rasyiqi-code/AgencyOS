"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { TypingHeroTitle } from "./typing-hero-title";

interface HeroContentProps {
    agencyName: string;
}

export function HeroContent({ agencyName }: HeroContentProps) {
    const t = useTranslations("Hero");
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
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
                        className="space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1"
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
                            className="space-y-4"
                        >
                            <div className="text-4xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                                <TypingHeroTitle
                                    prefix={t("title1")}
                                    targets={t.raw("typing.build")}
                                />
                            </div>
                            <div className="text-2xl md:text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1] opacity-80">
                                <TypingHeroTitle
                                    prefix={t("forYour")}
                                    targets={t.raw("typing.audience")}
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
                                <Link href="/price-calculator">
                                    <Button size="lg" className="h-11 px-5 text-sm md:h-14 md:px-8 md:text-lg bg-brand-yellow text-black hover:bg-brand-yellow/90 rounded-full font-bold shadow-[0_0_20px_rgba(254,215,0,0.3)] hover:shadow-[0_0_35px_rgba(254,215,0,0.5)] transition-all">
                                        {t("launchDashboard")}
                                        <ArrowRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </Link>
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
                                        repeat: Infinity,
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
                            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                            className="relative w-full h-[400px] sm:h-[550px] lg:h-[600px] xl:h-[700px] z-10 flex items-end justify-center"
                        >


                            {/* Business Visuals Masking Layer (Bottom) */}
                            <BusinessVisuals />

                            {/* Floating AI Model Badges - Background Layer (Middle) */}
                            <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-40">
                                <BadgeWrapper delay={1.4} duration={5} top="15%" className="left-2 lg:-left-1">
                                    <BadgeContent name="OpenAI" model="GPT" icon="/brands/openai.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={1.6} duration={7} top="42%" className="left-2 lg:-left-3">
                                    <BadgeContent name="Google" model="Gemini" icon="/brands/gemini.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={1.8} duration={6} top="8%" className="right-2 lg:right-1">
                                    <BadgeContent name="Anthropic" model="Claude" icon="/brands/claude.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={1.5} duration={8} bottom="45%" className="right-2 lg:-right-2">
                                    <BadgeContent name="DeepSeek" model="DeepSeek-V3" icon="/brands/deepseek.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.0} duration={9} top="25%" className="right-2 lg:-right-3">
                                    <BadgeContent name="Meta" model="Llama" icon="/brands/llama.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={1.7} duration={6.5} bottom="25%" className="right-2 lg:-right-1">
                                    <BadgeContent name="Mistral" model="Mistral" icon="/brands/mistral.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.2} duration={11} top="65%" className="left-2 lg:-left-4">
                                    <BadgeContent name="Perplexity" model="Sonar" icon="/brands/perplexityai.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={1.9} duration={9.5} bottom="10%" className="left-2 lg:-left-1.5">
                                    <BadgeContent name="HuggingFace" model="Open Source" icon="/brands/huggingface.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.4} duration={12} top="5%" className="lg:hidden left-2">
                                    <BadgeContent name="xAI" model="Grok" icon="/brands/grok.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.4} duration={12} top="2%" left="50%" transformX="-50%" className="hidden lg:block">
                                    <BadgeContent name="xAI" model="Grok" icon="/brands/grok.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.1} duration={8.5} bottom="15%" className="right-4 lg:right-[10%]">
                                    <BadgeContent name="Groq" model="LPU Engine" icon="/brands/groq.svg" isSvg />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.3} duration={7.5} top="30%" className="right-2 lg:-right-1">
                                    <BadgeContent name="Cohere" model="Command R" icon="/brands/cohere.png" />
                                </BadgeWrapper>

                                <BadgeWrapper delay={2.5} duration={10.5} bottom="60%" className="left-2 lg:-left-2">
                                    <BadgeContent name="Aya" model="Multilingual" icon="/brands/aya.svg" isSvg />
                                </BadgeWrapper>
                            </div>

                            <Image
                                src="/expert.png"
                                alt="Expert Model"
                                fill
                                unoptimized
                                className="object-contain object-bottom relative z-10"
                                priority
                                sizes="(max-width: 1024px) 100vw, 800px"
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
                                        opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="text-xl md:text-3xl xl:text-4xl font-black italic tracking-tighter text-brand-yellow/80 drop-shadow-[0_0_10px_rgba(254,215,0,0.7)] drop-shadow-[0_0_20px_rgba(254,215,0,0.4)] leading-none"
                                >
                                    BUILD TO SCALE.
                                </motion.p>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{
                                        y: 0,
                                        opacity: [0.7, 1, 0.8, 1],
                                    }}
                                    transition={{
                                        y: { duration: 1.2, delay: 1.4 },
                                        opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                                    }}
                                    className="text-xl md:text-3xl xl:text-4xl font-black italic tracking-tighter text-brand-yellow/80 drop-shadow-[0_0_10px_rgba(254,215,0,0.7)] drop-shadow-[0_0_20px_rgba(254,215,0,0.4)] leading-none mt-2"
                                >
                                    DESIGN TO PREVAIL.
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}

function BadgeWrapper({ children, delay, duration, top, left, right, bottom, className, transformX = "0" }: {
    children: React.ReactNode;
    delay: number;
    duration: number;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    className?: string;
    transformX?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0]
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                scale: { duration: 0.5, delay },
                y: {
                    duration,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
            style={{
                position: 'absolute',
                top, left, right, bottom,
                translateX: transformX,
                zIndex: 0
            }}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-lg shadow-2xl group/badge transition-transform hover:scale-110 ${className}`}
        >
            {children}
        </motion.div>
    );
}

function BadgeContent({ name, model, icon, isSvg = false }: {
    name: string;
    model: string;
    icon: string;
    isSvg?: boolean;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-md overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500 ${isSvg ? 'flex items-center justify-center bg-zinc-800' : ''}`}>
                {isSvg ? (
                    <Image src={icon} alt={name} width={12} height={12} className="object-contain" />
                ) : (
                    <Image src={icon} alt={name} fill unoptimized className="object-cover" sizes="20px" />
                )}
            </div>
            <div>
                <div className="text-[7px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">{name}</div>
                <div className="text-[9px] font-bold text-white leading-none mt-0.5">{model}</div>
            </div>
        </div>
    );
}

const BusinessVisuals = () => {
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

                {/* Grid Lines */}
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

                {/* Growth Path */}
                <motion.path
                    d="M 0 350 Q 150 330 300 250 T 600 150 T 800 50"
                    fill="none"
                    stroke="url(#growthGradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                />

                {/* Secondary Path */}
                <motion.path
                    d="M 0 380 Q 200 360 400 320 T 700 220 T 800 180"
                    fill="none"
                    stroke="rgba(254,215,0,0.1)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                />
            </svg>

            {/* Floating Business Icons/Nodes */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        y: [-10, 10, -10],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[10%] text-brand-yellow"
                >
                    <TrendingUp size={48} strokeWidth={1} />
                </motion.div>

                <motion.div
                    animate={{
                        y: [10, -10, 10],
                        opacity: [0.05, 0.2, 0.05]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[30%] right-[15%] text-brand-yellow"
                >
                    <BarChart3 size={64} strokeWidth={1} />
                </motion.div>

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] right-[10%] text-brand-yellow"
                >
                    <Activity size={40} strokeWidth={1} />
                </motion.div>
            </div>
        </div>
    );
};
