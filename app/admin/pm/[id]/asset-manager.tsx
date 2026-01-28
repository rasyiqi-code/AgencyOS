
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Loader2, Save, Github, Globe } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TechnicalAssetManagerProps {
    project: {
        id: string;
        repoUrl: string | null;
        repoOwner: string | null;
        repoName: string | null;
        deployUrl: string | null;
    };
}

export function TechnicalAssetManager({ project }: TechnicalAssetManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState({
        repoOwner: project.repoOwner || "",
        repoName: project.repoName || "",
        deployUrl: project.deployUrl || "",
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    repoUrl: form.repoOwner && form.repoName ? `https://github.com/${form.repoOwner}/${form.repoName}` : null
                }),
            });

            if (!res.ok) throw new Error("Failed to update assets");

            toast.success("Technical assets updated");
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update technical assets");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full gap-2 border-dashed border-white/10 hover:border-white/20 text-zinc-500 hover:text-zinc-300"
            >
                <Settings2 className="w-3.5 h-3.5" />
                Manage Technical Assets
            </Button>
        );
    }

    return (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5" />
                    Asset Configuration
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="h-6 text-[10px] text-zinc-500 hover:text-white"
                >
                    Cancel
                </Button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                            <Github className="w-2.5 h-2.5" /> GitHub Owner
                        </label>
                        <Input
                            value={form.repoOwner}
                            onChange={(e) => setForm({ ...form, repoOwner: e.target.value })}
                            placeholder="e.g. vercel"
                            className="h-8 text-xs bg-black/40 border-white/5 focus-visible:ring-blue-500/50 text-white placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                            <Github className="w-2.5 h-2.5" /> Repo Name
                        </label>
                        <Input
                            value={form.repoName}
                            onChange={(e) => setForm({ ...form, repoName: e.target.value })}
                            placeholder="e.g. next.js"
                            className="h-8 text-xs bg-black/40 border-white/5 focus-visible:ring-blue-500/50 text-white placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" /> Vercel Deploy Hook
                    </label>
                    <Input
                        value={form.deployUrl}
                        onChange={(e) => setForm({ ...form, deployUrl: e.target.value })}
                        placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                        className="h-8 text-xs bg-black/40 border-white/5 focus-visible:ring-blue-500/50 text-white placeholder:text-zinc-600"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs gap-2"
                >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save Configuration
                </Button>
            </div>
        </div>
    );
}
