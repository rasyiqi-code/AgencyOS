"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface EditKeyDialogProps {
    keyData: {
        id: string;
        label: string | null;
        modelId: string | null;
        key: string;
    };
    onSave: (id: string, label: string, modelId: string) => Promise<void>;
}

export function EditKeyDialog({ keyData, onSave }: EditKeyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [label, setLabel] = useState(keyData.label || "");
    const [modelId, setModelId] = useState(keyData.modelId || "");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onSave(keyData.id, label, modelId);
            toast.success("Key updated and activated!");
            setOpen(false);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Modify API Key Metadata</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Update the label or model associated with this key. Saving will also set this key to <strong>Active</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Label Identifier</label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Production-Main"
                            className="bg-black/20 border-white/10 text-sm focus-visible:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Target Model (Override)</label>
                        <Input
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            placeholder="gemini-1.5-flash"
                            className="bg-black/20 border-white/10 text-sm font-mono placeholder:font-sans focus-visible:ring-blue-500/50"
                        />
                    </div>

                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Fingerprint</p>
                        <p className="text-xs font-mono text-zinc-300 truncate">{keyData.key.substring(0, 16)}...</p>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save & Activate
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
