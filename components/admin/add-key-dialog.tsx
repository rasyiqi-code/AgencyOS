"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verifyAndSaveGoogleKey, verifyAndSaveNvidiaKey } from "@/app/actions/system-keys";

export function AddKeyDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [provider, setProvider] = useState<"google" | "nvidia">("google");
    const [label, setLabel] = useState("");
    const [modelId, setModelId] = useState("");
    const [key, setKey] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (provider === "nvidia") {
                await verifyAndSaveNvidiaKey(key, label, modelId);
            } else {
                await verifyAndSaveGoogleKey(key, label, modelId);
            }
            toast.success("Key Verified & Saved!");
            setOpen(false);
            setLabel("");
            setModelId("");
            setKey("");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-2 bg-blue-600 hover:bg-blue-500 text-white">
                    <Plus className="w-4 h-4" />
                    Add Key
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Inject New API Key</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        We will perform a test request to verify the key before saving.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">AI Provider</label>
                        <Select value={provider} onValueChange={(val: "google" | "nvidia") => {
                            setProvider(val);
                            setModelId("");
                        }}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-sm text-zinc-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                <SelectItem value="google">Google Gemini</SelectItem>
                                <SelectItem value="nvidia">Nvidia NIM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Label Identifier</label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder={provider === "nvidia" ? "e.g. Nvidia-DiffGemma" : "e.g. Production-Main"}
                            className="bg-black/20 border-white/10 text-sm focus-visible:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Target Model (Optional Override)</label>
                        <Input
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            placeholder={provider === "nvidia" ? "google/diffusiongemma-26b-a4b-it" : "gemini-1.5-flash"}
                            className="bg-black/20 border-white/10 text-sm font-mono placeholder:font-sans focus-visible:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Secret Key Payload</label>
                        <Input
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            type="password"
                            placeholder={provider === "nvidia" ? "nvapi-..." : "AIzA..."}
                            required
                            className="bg-black/20 border-white/10 text-sm font-mono focus-visible:ring-blue-500/50"
                        />
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
                                    Verifying Connection...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Verify & Authorize Key
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
