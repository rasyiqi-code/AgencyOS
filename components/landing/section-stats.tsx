"use client";

import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";
import { useTranslations } from "next-intl";
import { Users, Globe, Award } from "lucide-react";

export function SectionStats() {
    const t = useTranslations("Stats");

    const stats = [
        {
            key: "experience",
            value: 12,
            suffix: "+",
            icon: Award,
        },
        {
            key: "web",
            value: 300,
            suffix: "+",
            icon: Globe,
        },
        {
            key: "client",
            value: 179,
            suffix: "+",
            icon: Users,
        },
    ];

    return (
        <section className="py-8 md:py-12 bg-black border-t border-white/5 relative overflow-hidden">
            {/* Background Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-3 gap-2 md:gap-8 divide-x divide-white/10">
                    {stats.map((stat) => (
                        <div key={stat.key} className="flex flex-col items-center justify-center py-2 px-1 md:px-4 text-center group">
                            <div className="mb-2 md:mb-4">
                                <stat.icon className="w-5 h-5 md:w-8 md:h-8 text-zinc-500 group-hover:text-brand-yellow transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl md:text-5xl font-bold text-white mb-0.5 md:mb-1 tracking-tighter flex items-center justify-center">
                                <CounterItem from={0} to={stat.value} duration={2} />
                                <span className="text-brand-yellow/80 ml-0.5 md:ml-1">{stat.suffix}</span>
                            </h3>
                            <p className="text-zinc-500 uppercase tracking-widest text-[7px] md:text-[10px] font-bold mt-0.5 md:mt-1">
                                {t(stat.key)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CounterItem({ from, to, duration }: { from: number; to: number; duration: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true, margin: "-20px" });

    useEffect(() => {
        const node = nodeRef.current;
        if (!node || !inView) return;

        const controls = animate(from, to, {
            duration: duration,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = Math.round(value).toString();
            }
        });

        return () => controls.stop();
    }, [from, to, duration, inView]);

    return <span ref={nodeRef} className="tabular-nums">{from}</span>;
}
