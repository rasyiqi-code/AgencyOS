"use client";

import { useTranslations } from "next-intl";
import { Terminal, ShieldCheck, CircleDollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";


const LOGOS = {
    Nodejs: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M117.1 33.3L67.5 4.6c-2.2-1.3-4.9-1.3-7.1 0L10.9 33.3C8.7 34.6 7.3 36.9 7.3 39.5v57.4c0 2.5 1.4 4.9 3.6 6.1l49.6 28.7c2.2 1.3 4.9 1.3 7.1 0l49.6-28.7c2.2-1.3 3.6-3.6 3.6-6.1V39.5c-.1-2.6-1.5-4.9-3.7-6.2z" fill="#339933"/>
        </svg>
    ),
    Tailwind: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 32c-12 0-18 6-18 18 0 11.3 4.7 15.1 9 18 2.6 1.7 5.1 3.4 5.1 7 0 3.7-3.6 5.5-9 5.5-12 0-18-6-18-18H16c0 12 6 24 24 24 12 0 18-6 18-18 0-11.3-4.7-15.1-9-18-2.6-1.7-5.1-3.4-5.1-7 0-3.7 3.6-5.5 9-5.5 12 0 18 6 18 18h16c0-12-6-24-24-24z" fill="#38BDF8"/>
        </svg>
    ),
    Docker: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.983 11.078h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm-2.891 0h2.117c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186h-2.117c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm-2.891 0h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186H8.201c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm-2.891 0h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186H5.31c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm2.891-2.891h2.117c.102 0 .186-.084.186-.186V6.36c0-.102-.084-.186-.186-.186h-2.117c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm2.891 0h2.119c.102 0 .186-.084.186-.186V6.36c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm-2.891-2.891h2.117c.102 0 .186-.084.186-.186V3.469c0-.102-.084-.186-.186-.186h-2.117c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm2.891 5.782h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm-2.891 0h2.117c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186h-2.117c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm14.747-2.905c-.385 1.178-1.564 2.122-2.905 2.122-1.34 0-2.52-.944-2.905-2.122h-1.319c.102 1.439.814 2.668 1.933 3.469l.34.254v2.712c0 .102.084.186.186.186h1.22c.102 0 .186-.084.186-.186v-1.641c0-.102.084-.186.186-.186h.61c.102 0 .186.084.186.186v1.641c0 .102.084.186.186.186h1.22c.102 0 .186-.084.186-.186v-2.712l.34-.254c1.119-.801 1.831-2.03 1.933-3.469h-1.319zm-1.319 3.469c0 .763-.618 1.381-1.381 1.381s-1.381-.618-1.381-1.381.618-1.381 1.381-1.381 1.381.618 1.381 1.381z" fill="#2496ED"/>
        </svg>
    ),
    Postgres: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 12.8C43.1 12.8 24.6 23.3 12.8 40.5c-2.4 3.5-3.8 7.7-3.8 12.3 0 12.8 10.4 23.2 23.2 23.2h6.4c1.8 0 3.2 1.4 3.2 3.2v6.4c0 10.6 8.6 19.2 19.2 19.2s19.2-8.6 19.2-19.2v-6.4c0-1.8 1.4-3.2 3.2-3.2h6.4c12.8 0 23.2-10.4 23.2-23.2 0-4.6-1.4-8.8-3.8-12.3C103.4 23.3 84.9 12.8 64 12.8z" fill="#336791"/>
        </svg>
    ),
    Redis: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 1.5C29.5 1.5 1.5 29.5 1.5 63.9s28 62.4 62.4 62.4 62.4-28 62.4-62.4S98.5 1.5 64 1.5z" fill="#D82C20"/>
        </svg>
    ),
    Figma: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.7 0C29.4 0 18.7 10.7 18.7 24s10.7 24 24 24h24V0h-24zm0 48C29.4 48 18.7 58.7 18.7 72s10.7 24 24 24c13.3 0 24-10.7 24-24V48h-24zM18.7 104c0 13.3 10.7 24 24 24s24-10.7 24-24h-24c-13.3 0-24 10.7-24 24zM66.7 48h24c13.3 0 24-10.7 24-24S104 0 90.7 0h-24v48zm0 48V48h24c13.3 0 24 10.7 24 24s-10.7 24-24 24h-24z" fill="#F24E1E"/>
        </svg>
    ),
    React: (
        <svg className="w-4 h-4" viewBox="-11.5 -10.23174 23 20.46348" xmlns="http://www.w3.org/2000/svg">
            <circle r="2.05" fill="#61dafb"/>
            <g fill="none" stroke="#61dafb">
                <ellipse rx="11" ry="4.2"/>
                <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
            </g>
        </svg>
    ),
    Nextjs: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 121.6C32.2 121.6 6.4 95.8 6.4 64S32.2 6.4 64 6.4s57.6 25.8 57.6 57.6-25.8 57.6-57.6 57.6zM96.7 96.7L46.1 33.3H33.3v61.4h6.4V45.9l46.1 57.6 10.9-6.8zM89.6 33.3H83.2v61.4h6.4V33.3z" fill="white"/>
        </svg>
    ),
    Python: (
        <svg className="w-4 h-4" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-22.5 0-40.7-18.2-40.7-40.7V146.3c0-41.7 33.9-75.6 75.6-75.6h10.8c34.3 0 54.2-22.3 54.2-53.4C272.6 6.5 251 0 223.9 0c-49.8 0-82.6 33.3-82.6 82.6v47.4H101.2C45.3 130 0 175.3 0 231.2v69.6C0 356.7 45.3 402 101.2 402h40.1v-47.4c0-36.8 31.2-67.8 66.8-67.8h106.8c22.5 0 40.7 18.2 40.7 40.7v74.5c0 41.7-33.9-75.6-75.6-75.6h-10.8c-34.3 0-54.2-22.3-54.2-53.4 0-10.8 21.6 17.3 48.7 17.3 49.8 0 82.6-33.3 82.6-82.6v-47.4h40.1c55.9 0 101.2-45.3 101.2-101.2v-69.6c0-5.3-0.4-10.5-1.2-15.6z" fill="#3776AB"/>
        </svg>
    ),
    TypeScript: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 63.9C1.5 29.5 29.5 1.5 63.9 1.5c34.4 0 62.4 28 62.4 62.4s-28 62.4-62.4 62.4c-34.4 0-62.4-28-62.4-62.4z" fill="#3178c6"/>
            <path d="M100.2 87.2c-1.3-1.3-2.6-2.1-4.1-2.5-1.5-.4-3.1-.6-4.8-.6-2.2 0-4.1.4-5.8 1.3-1.7.9-3.1 2.2-4.1 3.8-1 1.6-1.5 3.5-1.5 5.6 0 2.2.5 4.1 1.5 5.7 1 1.6 2.4 2.8 4.2 3.7 1.8.9 3.8 1.4 6.1 1.4 1.8 0 3.6-.3 5.1-.8 1.6-.5 2.8-1.3 3.8-2.3l6.4 5.2c-2.4 2.6-5.3 4.6-8.8 5.9-3.5 1.3-7.4 2-11.7 2-4.1 0-7.9-.7-11.4-2.2-3.5-1.4-6.4-3.6-8.8-6.4-2.4-2.8-4.2-6.1-5.4-9.9-1.2-3.8-1.8-7.9-1.8-12.3s.6-8.5 1.8-12.3c1.2-3.8 3-7.1 5.4-9.9 2.4-2.8 5.3-5 8.8-6.4 3.5-1.4 7.3-2.2 11.4-2.2 4.4 0 8.3.7 11.8 2 3.5 1.3 6.5 3.4 8.9 6.1l-6.2 5.5z" fill="#fff"/>
        </svg>
    ),
    WordPress: (
        <svg className="w-4 h-4" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M61.7 169.4l101.5 278C92.2 413 43.3 340.2 43.3 256c0-30.9 6.7-59.9 18.4-86.6zm337.9 75.9c0-26.3-9.4-44.5-17.5-58.7-10.8-17.5-20.9-32.4-20.9-49.9 0-19.6 14.8-37.8 35.7-37.8.9 0 1.8.1 2.8.2-37.9-34.7-88.3-55.9-143.7-55.9-74.3 0-139.7 38.1-177.8 95.9 5 .2 9.7.3 13.7.3 22.2 0 56.7-2.7 56.7-2.7 11.5-.7 12.8 16.2 1.4 17.5 0 0-11.5 1.3-24.3 2l77.5 230.4L249.8 247l-33.1-90.8c-11.5-.7-22.3-2-22.3-2-11.5-.7-10.1-18.2 1.3-17.5 0 0 35.1 2.7 56 2.7 22.2 0 56.7-2.7 56.7-2.7 11.5-.7 12.8 16.2 1.4 17.5 0 0-11.5 1.3-24.3 2l76.9 228.7 21.2-70.9c9-29.4 16-50.5 16-68.7zm-143.7 20l-64.7 187.4 64.7-187.4zm10.5 2.1l63.2 182.1c43.2-24.5 76.8-63.5 93.1-110.3l-1.4-.7c-13.5-6.7-23.6-17.5-23.6-32.4 0-14.2 9.5-27 18.2-40.5 6.1-9.5 12.2-20.3 12.2-32.4 0-4.1-.3-8.1-1-12 11.5 22.5 18.1 48 18.1 75.1 0 71-45 131.2-108.5 153.8L353 267.4zm-110.4 198c18.1 4.7 37 7.3 56.4 7.3 13.7 0 27.1-1.3 40.1-3.7l-96.5-280.9-106.1 277.3zM256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z" fill="#21759B"/>
        </svg>
    ),
    AWS: (
        <svg className="w-4 h-4" viewBox="0 0 79 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.2 29.5c-4 0-7.3-1.6-9.1-4.4-1.1-1.7-1.5-3.8-1.5-6.6 0-2.8.4-4.8 1.3-6.4 1.8-3 5-4.8 9.3-4.8 3 0 5.4.9 6.8 2.4.4.4.6 1 .6 1.7 0 1.2-1 1.9-2.2 1.9-.6 0-1-.2-1.4-.5-.6-.5-1.7-1.1-3.6-1.1-2.9 0-5.1 1.6-6 4.3-.3 1-.5 2.1-.5 3.3s.2 2.3.5 3.4c.9 2.5 3.1 4.1 5.9 4.1 1.8 0 3-.6 3.6-1.1.4-.3.8-.5 1.4-.5 1.2 0 2.2.7 2.2 1.9 0 .6-.2 1.2-.6 1.7-1.5 1.5-3.8 2.6-7 2.6zm22.4 0c-1.8 0-3.3-.4-4.3-1.2-.5-.4-.7-.9-.7-1.4 0-1 .9-1.9 2-1.9.5 0 .8.1 1.1.3.6.4 1.4.7 2.2.7 1.4 0 2.4-.7 2.4-2.1v-1.7c-1.1 1.1-2.9 1.8-5.1 1.8-5 0-9-3.4-9-9.1s4.1-9.1 9-9.1c2.2 0 4 .7 5.1 1.8V8.1c0-.7.5-1.2 1.3-1.2 1 0 1.7.7 1.7 1.7v16.1c0 3.7-2.7 4.8-6.7 4.8zm-4.3-14.7c0 3.4 2.2 5.5 5.2 5.5s5.2-2.1 5.2-5.5-2.2-5.5-5.2-5.5-5.2 2.1-5.2 5.5zm-45 14.7c-4 0-7.2-1.6-9.1-4.3-.9-1.3-1.3-3.1-1.3-5.2 0-.8.6-1.3 1.4-1.3.7 0 1.2.4 1.4.9.4.9 1.2 1.7 2.2 2.3.9.6 2.3.9 3.8.9 2.4 0 4-.9 4.8-2.6.4-.8.5-1.8.5-2.9V13.8c-1.1 1.1-2.9 1.8-5.1 1.8-5 0-9.1-3.4-9.1-9.1s4.1-9.1 9.1-9.1c2.2 0 4 .7 5.1 1.8V0.3C18.6.1 18.8 0 19 0h2.4c.3 0 .4.1.4.4v23c0 4.1-2.4 6.1-5.5 6.1zm-4.4-23.1c0 3.4 2.2 5.5 5.2 5.5s5.2-2.1 5.2-5.5-2.2-5.5-5.2-5.5-5.2 2.1-5.2 5.5z" fill="#FF9900"/>
        </svg>
    ),
    Flutter: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M74.1 1.5L25.9 49.7l17 17L91.1 1.5H74.1zM42.9 66.7l-17 17L74.1 133.5h17L42.9 66.7zM74.1 66.7l-8.5 8.5 8.5 8.5h17l-8.5-8.5 8.5-8.5h-17z" fill="#02569B"/>
        </svg>
    ),
    Swift: (
        <svg className="w-4 h-4" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M472.5 352c-20.6 30.5-54.7 58-100.8 77.2-41.4 17.1-84 22.8-121.7 22.8-56.3 0-101.4-13.8-132.8-38.3 47.9 4 100.9-10.7 141.7-41.9-42 3.1-85.3-12.8-115.1-42.5-31-30.8-44.5-73.4-44.5-115.9 0-11.8 1.1-23.4 3.2-34.7 1.8 11.2 5.5 22.2 11.1 32.5 16.5 30.3 43.1 55.4 81.3 71.9-25.2-46.3-25.1-105.7 1.1-152.9 14.8-26.6 38.6-47.5 66.9-59.5-12.2 24-12.1 52.8-1.5 77.1 11.1 25.5 34.6 44.1 63.3 49.5-3.6-35.3 7.8-71.1 31.8-97.4 22.9-25 54.4-38 86.6-38.5 2.1 0 4.1 0 6.2.1-19.1 27.2-24.9 62.5-15.5 94.6 8.5 29 27.7 53.6 53.3 69.2-22.3-2.5-44.4-11.8-62.6-27.1 1.7 27.8 12.3 54.6 31 75.8 19.3 22 45.4 35.8 72.8 40.5-26 5.8-53.1 5-78.6-2.5 13.9 26.2 38.8 46.2 69.4 53.3 24.1 5.6 49.2 4.1 72.3-3.6z" fill="#F05138"/>
        </svg>
    ),
    Kotlin: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 126.5V1.5h125L64 64l62.5 62.5H1.5z" fill="#7F52FF"/>
        </svg>
    ),
    Go: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 12.8C43.1 12.8 24.6 23.3 12.8 40.5V115.2h102.4V40.5C103.4 23.3 84.9 12.8 64 12.8z" fill="#00ADD8"/>
        </svg>
    ),
    Electron: (
        <svg className="w-4 h-4" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 1.5C29.5 1.5 1.5 29.5 1.5 63.9s28 62.4 62.4 62.4 62.4-28 62.4-62.4S98.5 1.5 64 1.5z" fill="#47848F"/>
        </svg>
    ),
};

const TECH_STACK = [
    { name: "React", logo: LOGOS.React, color: "text-[#61DAFB]" },
    { name: "Next.js", logo: LOGOS.Nextjs, color: "text-white" },
    { name: "Node.js", logo: LOGOS.Nodejs, color: "text-[#339933]" },
    { name: "Flutter", logo: LOGOS.Flutter, color: "text-[#02569B]" },
    { name: "Swift", logo: LOGOS.Swift, color: "text-[#F05138]" },
    { name: "Kotlin", logo: LOGOS.Kotlin, color: "text-[#7F52FF]" },
    { name: "Tailwind", logo: LOGOS.Tailwind, color: "text-[#38BDF8]" },
    { name: "TypeScript", logo: LOGOS.TypeScript, color: "text-[#3178C6]" },
    { name: "Docker", logo: LOGOS.Docker, color: "text-[#2496ED]" },
    { name: "Go", logo: LOGOS.Go, color: "text-[#00ADD8]" },
    { name: "Python", logo: LOGOS.Python, color: "text-[#3776AB]" },
    { name: "Electron", logo: LOGOS.Electron, color: "text-[#47848F]" },
    { name: "Postgres", logo: LOGOS.Postgres, color: "text-[#336791]" },
    { name: "Redis", logo: LOGOS.Redis, color: "text-[#D82C20]" },
    { name: "WordPress", logo: LOGOS.WordPress, color: "text-[#21759B]" },
    { name: "AWS", logo: LOGOS.AWS, color: "text-[#FF9900]" },
    { name: "Figma", logo: LOGOS.Figma, color: "text-[#F24E1E]" },
];

export function SectionStats() {
    const t = useTranslations("Stats");

    const stats = [
        {
            key: "stack",
            icon: Terminal,
        },
        {
            key: "royalty",
            icon: ShieldCheck,
        },
        {
            key: "performance",
            icon: CircleDollarSign,
        },
    ];

    return (
        <section className="py-8 md:py-12 bg-black border-t border-white/5 relative overflow-hidden">
            {/* Background Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-brand-yellow/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-3 gap-2 md:gap-8 divide-x divide-white/10">
                    {stats.map((stat) => (
                        <div key={stat.key} className="flex flex-col items-center justify-center py-2 md:py-0 px-1 md:px-4 text-center group">
                            <div className="mb-2">
                                <stat.icon className="w-3 h-3 md:w-5 md:h-5 text-zinc-500 group-hover:text-brand-yellow transition-colors duration-300" />
                            </div>
                            <h3 className="text-[10px] md:text-2xl font-black text-white mb-0.5 md:mb-1 tracking-tight md:tracking-tighter text-balance group-hover:text-brand-yellow transition-colors">
                                {t(`${stat.key}.title`)}
                            </h3>
                            <div className="flex flex-col items-center gap-1">
                                {stat.key !== "stack" && (
                                    <p className="text-zinc-500 text-[7px] md:text-[10px] font-bold uppercase tracking-widest leading-none max-w-xs mx-auto">
                                        {t(`${stat.key}.desc`)}
                                    </p>
                                )}
                                {stat.key === "stack" && (
                                    <div className="h-4 md:h-6 flex items-center justify-center overflow-hidden w-full">
                                        <TechRotator />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TechRotator() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % TECH_STACK.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/5 bg-white/5 text-[8px] md:text-xs font-bold tracking-widest uppercase shadow-2xl flex items-center gap-1 md:gap-2 ${TECH_STACK[index].color}`}
                >
                    {TECH_STACK[index].logo}
                    <span>{TECH_STACK[index].name}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
