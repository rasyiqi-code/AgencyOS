"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";

import { ClientRenewButton } from "./renew-subscription-button";

type ServiceData = { interval?: string, price: number, currency?: string | null };

interface EstimateData {
    id: string;
    title: string;
    summary: string;
    totalCost: number;
    service?: { currency?: string | null } | null;
}

interface ProjectData {
    id: string;
    title: string;
    subscriptionEndsAt?: string | Date | null;
    totalAmount?: number | null;
    description?: string | null;
    estimate?: { summary?: string | null } | null;
    service?: ServiceData | null;
}

export function UnpaidBills({ unpaidEstimates, projectsNeedingRenewal = [] }: { unpaidEstimates: EstimateData[], projectsNeedingRenewal?: ProjectData[] }) {
    if ((!unpaidEstimates || unpaidEstimates.length === 0) && (!projectsNeedingRenewal || projectsNeedingRenewal.length === 0)) return null;

    return (
        <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Tagihan Belum Dibayar
            </h2>
            <div className="grid gap-4">
                {unpaidEstimates.map((est) => (
                    <div key={est.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-white">{est.title}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{est.summary}</p>
                            <p className="text-xs font-mono text-zinc-500 mt-2">Invoice #{est.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Total</span>
                                <span className="text-lg font-bold text-white">
                                    <PriceDisplay amount={est.totalCost as number} baseCurrency={(((est.service as unknown as ServiceData)?.currency) as "USD" | "IDR") || 'USD'} />
                                </span>
                            </div>
                            <Link href={`/id/checkout/${est.id}`}>
                                <Button className="bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto">
                                    Bayar Sekarang
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}

                {projectsNeedingRenewal.map((project) => {
                    const serviceData = project.service as unknown as ServiceData;
                    let recurringAmount = 0;
                    if (serviceData?.interval === 'monthly' || serviceData?.interval === 'yearly') {
                        recurringAmount += serviceData?.price || 0;
                    }

                    const summaryText = project.estimate?.summary || project.description || "";
                    const lines = summaryText.split('\n');
                    lines.forEach((line: string) => {
                        if (line.includes('Monthly') || line.includes('Yearly')) {
                            const match = line.match(/\(\D*([\d.]+)\s+(Monthly|Yearly)\)/i);
                            if (match && match[1]) {
                                recurringAmount += parseFloat(match[1]);
                            }
                        }
                    });

                    if (recurringAmount === 0 && project.totalAmount && project.totalAmount > 0) {
                        recurringAmount = project.totalAmount;
                    }

                    return (
                    <div key={project.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white">{project.title}</h3>
                                <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold">RENEWAL</span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">Langganan layanan Anda sudah mendekati masa tenggang atau sudah berakhir.</p>
                            <p className="text-xs font-mono text-zinc-500 mt-2">
                                Berakhir pada: {project.subscriptionEndsAt ? new Date(project.subscriptionEndsAt as string | Date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Perkiraan Tagihan</span>
                                <span className="text-lg font-bold text-white">
                                    <PriceDisplay amount={recurringAmount} baseCurrency={(serviceData?.currency as "USD" | "IDR") || 'USD'} />
                                </span>
                            </div>
                            <ClientRenewButton 
                                projectId={project.id} 
                            />
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
}
