
import React from 'react';

export function TechnicalSpecsViewer({ spec }: { spec: string }) {
    let parsedSpec: {
        screens?: { title: string; description: string; hours?: number }[];
        apis?: { title: string; description: string; hours?: number }[];
    } | null = null;
    try {
        parsedSpec = JSON.parse(spec);
    } catch {
        // If not JSON, render as plain text
        return (
            <div className="p-3 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-zinc-400 whitespace-pre-wrap">
                {spec}
            </div>
        );
    }

    if (!parsedSpec || (typeof parsedSpec !== 'object')) {
        return (
            <div className="p-3 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-zinc-400 whitespace-pre-wrap">
                {spec}
            </div>
        );
    }

    // Check if it matches our expected JSON structure (screens, apis)
    const hasscreens = Array.isArray(parsedSpec.screens);
    const hasapis = Array.isArray(parsedSpec.apis);

    if (!hasscreens && !hasapis) {
        return (
            <div className="p-3 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-zinc-400 whitespace-pre-wrap">
                {spec}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {hasscreens && parsedSpec?.screens && parsedSpec.screens.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-[10px] text-zinc-400 uppercase tracking-widest pl-1 border-l-2 border-emerald-500/50">Screens</h5>
                    <div className="grid gap-2">
                        {parsedSpec.screens?.map((screen, idx: number) => (
                            <div key={idx} className="p-2.5 bg-zinc-900/50 border border-white/5 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-zinc-200">{screen.title}</span>
                                    {screen.hours && <span className="text-[10px] font-mono text-zinc-500">{screen.hours}h</span>}
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">{screen.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasapis && parsedSpec?.apis && parsedSpec.apis.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-[10px] text-zinc-400 uppercase tracking-widest pl-1 border-l-2 border-blue-500/50">API Endpoints</h5>
                    <div className="grid gap-2">
                        {parsedSpec.apis?.map((api, idx: number) => (
                            <div key={idx} className="p-2.5 bg-zinc-900/50 border border-white/5 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-zinc-200">{api.title}</span>
                                    {api.hours && <span className="text-[10px] font-mono text-zinc-500">{api.hours}h</span>}
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">{api.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
