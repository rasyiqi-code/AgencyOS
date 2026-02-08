"use client";

import Link from "next/link";
import { ArrowRight, Clock, Github, Rocket, Calendar } from "lucide-react";
import type { ExtendedProject } from "@/lib/shared/types";
import { useCurrency } from "@/components/providers/currency-provider";

export function MissionCard({ project }: { project: ExtendedProject }) {
    const isDev = project.status === 'dev';
    const isDone = project.status === 'done';
    const isSubscription = !!project.subscriptionEndsAt;
    const isActive = project.subscriptionStatus === 'active';

    const { locale } = useCurrency();
    const isId = locale === 'id-ID' || locale === 'id';

    return (
        <div className="group block relative h-full">
            {/* Main Link Overlay */}
            <Link
                href={`/dashboard/missions/${project.id}`}
                className="absolute inset-0 z-0 rounded-2xl"
                aria-label={`View details for ${project.title}`}
            />

            <div className={`
                relative overflow-hidden rounded-2xl border p-6 h-full transition-all duration-300 pointer-events-none
                ${(isDev && !isSubscription) || (isSubscription && isActive)
                    ? 'bg-gradient-to-br from-brand-yellow/10 to-zinc-900/50 border-brand-yellow/30 group-hover:border-brand-yellow/50 group-hover:shadow-2xl group-hover:shadow-brand-yellow/10'
                    : 'bg-zinc-900/40 border-white/5 group-hover:border-white/10 group-hover:bg-zinc-900/60'
                }
            `}>
                {/* Background Glow for active projects */}
                {((isDev && !isSubscription) || (isSubscription && isActive)) && (
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-yellow/20 rounded-full blur-3xl group-hover:bg-brand-yellow/30 transition-all duration-700" />
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center border
                        ${(isDev && !isSubscription) || (isSubscription && isActive) ? 'bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow' : 'bg-zinc-800/50 border-white/5 text-zinc-400'}
                    `}>
                        {isSubscription ? <Calendar className="w-5 h-5" /> : (isDev ? <Rocket className="w-5 h-5" /> : <Github className="w-5 h-5" />)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <span className={`
                            px-3 py-1 rounded-full text-xs font-medium border
                            ${isActive && isSubscription ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                isDev ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20' :
                                    isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}
                        `}>
                            {isSubscription
                                ? (isActive ? (isId ? 'Aktif' : 'Active') : (isId ? 'Berakhir' : 'Expired'))
                                : (isDev ? (isId ? 'Dalam Pengerjaan' : 'In Progress') : project.status.toUpperCase())}
                        </span>
                        {isSubscription && project.subscriptionEndsAt && (
                            <span className="text-[10px] text-zinc-500">
                                {isId ? 'Berakhir:' : 'Ends:'} {new Date(project.subscriptionEndsAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-yellow transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                        {project.description}
                    </p>

                    {/* Payment Status Indicator for DP */}
                    {project.paymentStatus === 'PARTIAL' && (
                        <div className="flex flex-col xs:flex-row xs:items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2 pointer-events-auto">
                            <div className="flex-1">
                                <div className="text-[10px] uppercase tracking-wider text-amber-500 font-black mb-0.5">
                                    {isId ? 'Status Pembayaran' : 'Payment Status'}
                                </div>
                                <div className="text-sm text-amber-200 font-bold">
                                    {isId ? 'DP Lunas (50%)' : 'DP Paid (50%)'}
                                </div>
                            </div>
                            {project.estimateId && (
                                <Link
                                    href={`/checkout/${project.estimateId}?paymentType=REPAYMENT`}
                                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors whitespace-nowrap z-20 relative block text-center shadow-lg shadow-amber-500/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isId ? 'Lunasi Sekarang' : 'Pay Remaining'}
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-4 relative z-10">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isId ? 'Diperbarui' : 'Updated'} {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-zinc-400 group-hover:text-white">
                        {isId ? 'Lihat Detail' : 'View Details'} <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </div>
    );
}
