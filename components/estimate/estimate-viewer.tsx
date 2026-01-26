"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Monitor, Code2, Calendar, ArrowRight, Sparkles } from "lucide-react";

import { ChatInterface } from "@/components/chat-interface";

interface EstimateItem {
    title: string;
    description: string;
    hours: number;
}

interface Estimate {
    id: string;
    title: string;
    summary: string;
    screens: EstimateItem[];
    apis: EstimateItem[];
    totalHours: number;
    totalCost: number;
}

import { PriceDisplay } from "@/components/providers/currency-provider";

export function EstimateViewer({ estimate }: { estimate: Estimate }) {
    // Chat Sheet State
    // Refine Mode State
    const [isRefining, setIsRefining] = useState(false);

    // Parse JSON if needed (though passed from server component it might be object already)
    const initialScreens: EstimateItem[] = useMemo(() => Array.isArray(estimate.screens) ? estimate.screens : [], [estimate.screens]);
    const initialApis: EstimateItem[] = useMemo(() => Array.isArray(estimate.apis) ? estimate.apis : [], [estimate.apis]);

    // State for selected indices
    const [selectedScreenIndices, setSelectedScreenIndices] = useState<Set<number>>(
        new Set(initialScreens.map((_, i) => i))
    );
    const [selectedApiIndices, setSelectedApiIndices] = useState<Set<number>>(
        new Set(initialApis.map((_, i) => i))
    );

    // Derived State
    const { totalHours, totalCost, hourlyRate, activeScreensCount, activeApisCount } = useMemo(() => {
        let hours = 0;

        initialScreens.forEach((item, i) => {
            if (selectedScreenIndices.has(i)) hours += item.hours;
        });

        initialApis.forEach((item, i) => {
            if (selectedApiIndices.has(i)) hours += item.hours;
        });

        const impliedRate = Math.round(estimate.totalCost / (estimate.totalHours || 1));
        const estimatedTotalCost = hours * impliedRate;

        return {
            totalHours: hours,
            totalCost: estimatedTotalCost,
            hourlyRate: impliedRate,
            activeScreensCount: selectedScreenIndices.size,
            activeApisCount: selectedApiIndices.size
        };
    }, [selectedScreenIndices, selectedApiIndices, initialScreens, initialApis, estimate.totalCost, estimate.totalHours]);

    const timelineDays = Math.ceil(totalHours / 8);

    const toggleScreen = (index: number) => {
        const next = new Set(selectedScreenIndices);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setSelectedScreenIndices(next);
    };

    const toggleApi = (index: number) => {
        const next = new Set(selectedApiIndices);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setSelectedApiIndices(next);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <div className="text-zinc-500 text-sm mb-2">Summary & Specification /</div>
                    <h1 className="text-3xl font-bold text-white mb-4">{estimate.title}</h1>
                    <p className="text-zinc-400 leading-relaxed">
                        {estimate.summary}
                    </p>
                </div>

                <div className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                    Need to develop:
                </div>

                {/* Screens Section */}
                <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/80">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-white font-medium">Web app screens</div>
                                <div className="text-zinc-500 text-xs text-left">
                                    {activeScreensCount}/{initialScreens.length} selected
                                </div>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-white">
                            {initialScreens.filter((_, i) => selectedScreenIndices.has(i)).reduce((acc, s) => acc + s.hours, 0)} hrs
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {initialScreens.map((screen, idx) => {
                            const isSelected = selectedScreenIndices.has(idx);
                            return (
                                <div
                                    key={idx}
                                    className={`p-4 flex gap-4 transition-all duration-200 cursor-pointer ${isSelected ? 'hover:bg-white/5' : 'opacity-50 grayscale bg-black/20'}`}
                                    onClick={() => toggleScreen(idx)}
                                >
                                    <div className="mt-1 flex items-start">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-lime-500 border-lime-500' : 'border-zinc-700 bg-transparent'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-black font-bold" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-medium transition-colors ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`}>{screen.title}</div>
                                        <div className="text-zinc-500 text-sm mt-1">{screen.description}</div>
                                    </div>
                                    <div className="text-zinc-400 text-sm font-mono whitespace-nowrap">
                                        {screen.hours} hrs
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* APIs Section */}
                <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/80">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Code2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-white font-medium">APIs & Integrations</div>
                                <div className="text-zinc-500 text-xs text-left">
                                    {activeApisCount}/{initialApis.length} selected
                                </div>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-white">
                            {initialApis.filter((_, i) => selectedApiIndices.has(i)).reduce((acc, s) => acc + s.hours, 0)} hrs
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {initialApis.map((api, idx) => {
                            const isSelected = selectedApiIndices.has(idx);
                            return (
                                <div
                                    key={idx}
                                    className={`p-4 flex gap-4 transition-all duration-200 cursor-pointer ${isSelected ? 'hover:bg-white/5' : 'opacity-50 grayscale bg-black/20'}`}
                                    onClick={() => toggleApi(idx)}
                                >
                                    <div className="mt-1 flex items-start">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-lime-500 border-lime-500' : 'border-zinc-700 bg-transparent'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-black font-bold" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-medium transition-colors ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`}>{api.title}</div>
                                        <div className="text-zinc-500 text-sm mt-1">{api.description}</div>
                                    </div>
                                    <div className="text-zinc-400 text-sm font-mono whitespace-nowrap">
                                        {api.hours} hrs
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Dynamic Right Column Content */}
            {isRefining ? (
                <div className="sticky top-24 self-start animate-in fade-in slide-in-from-right-4 duration-300 z-30">
                    <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-[calc(100vh-8rem)] min-h-[500px] max-h-[700px] flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-zinc-800/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-lime-400" />
                                Proposal Assistant
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsRefining(false)}
                                className="text-zinc-400 hover:text-white h-8"
                            >
                                Cancel
                            </Button>
                        </div>
                        <div className="flex-1 bg-zinc-950 overflow-hidden min-h-0">
                            <ChatInterface initialContext={`
PROJECT OVERVIEW:
Title: ${estimate.title}
Summary: ${estimate.summary}

CURRENT ESTIMATE STATUS:
Total Hours: ${totalHours}
Total Cost: $${totalCost} (Approx)
Timeline: Approx ${timelineDays} days

SELECTED SCREENS (${selectedScreenIndices.size}):
${initialScreens.filter((_, i) => selectedScreenIndices.has(i)).map(s => `- ${s.title} (${s.hours}h)`).join('\n')}

SELECTED APIS (${selectedApiIndices.size}):
${initialApis.filter((_, i) => selectedApiIndices.has(i)).map(a => `- ${a.title} (${a.hours}h)`).join('\n')}
                                    `}
                                estimateId={estimate.id}
                                // onEstimateUpdate handled via router.refresh() in ChatInterface
                                minimal={true}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="sticky top-24 self-start space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 z-30">
                    <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 space-y-6 shadow-2xl">
                        <div className="text-center space-y-2 pb-6 border-b border-white/5">
                            <div className="text-zinc-500 text-sm">Est. Duration</div>
                            <div className="text-3xl font-bold text-white transition-all duration-300">{totalHours} hours</div>
                            <div className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Approx {timelineDays} working days
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Payment Type</span>
                                <Badge variant="outline" className="border-lime-500/30 text-lime-400 bg-lime-500/10">
                                    Milestone Based
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Rate</span>
                                <span className="text-white font-mono flex gap-1">
                                    <PriceDisplay amount={hourlyRate} />
                                    <span>/hr</span>
                                </span>
                            </div>
                        </div>


                        <div className="pt-6 border-t border-white/5 text-center space-y-2">
                            <div className="text-zinc-500 text-sm">Est. Total Cost</div>
                            <div className="text-4xl font-bold text-white tracking-tight transition-all duration-300">
                                <PriceDisplay amount={totalCost} />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                variant="outline"
                                className="w-full border-lime-500/20 hover:bg-lime-500/10 text-lime-400 hover:text-lime-300 font-medium h-12 text-base relative z-20 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsRefining(true);
                                }}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Proposal Assistant
                            </Button>

                            <Button
                                className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold h-12 text-base cursor-pointer"
                                onClick={async () => {
                                    // Call Server Action
                                    import("@/app/actions/estimate").then(async ({ finalizeEstimate }) => {
                                        try {
                                            const url = await finalizeEstimate(estimate.id);
                                            window.location.href = url;
                                        } catch (e) {
                                            console.error(e);
                                            // Handle error (alert/toast)
                                            alert("Failed to finalize. Please try again.");
                                        }
                                    });
                                }}
                            >
                                Finalize Quote & Start
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
