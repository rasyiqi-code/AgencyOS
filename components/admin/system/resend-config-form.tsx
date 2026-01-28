"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Key, Mail } from "lucide-react";
import { toast } from "sonner";
// import { saveResendKey, saveAdminTargetEmail } from "@/app/actions/email";

interface Props {
    currentKey: string | null;
    currentTargetEmail: string | null;
}

export function ResendConfigForm({ currentKey, currentTargetEmail }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState(currentKey || "");
    const [targetEmail, setTargetEmail] = useState(currentTargetEmail || "");

    // Mask the key if it exists purely for visual purposes initially
    const isConfigured = !!currentKey;

    async function handleSave() {
        if (!apiKey) {
            toast.error("API Key is required");
            return;
        }

        setIsLoading(true);
        try {
            // Save Key
            // Save Configuration
            const res = await fetch("/api/system/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resendKey: apiKey,
                    adminEmail: targetEmail || undefined
                })
            });

            if (!res.ok) throw new Error("Failed");
            toast.success("Email configuration updated successfully");
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="bg-zinc-900/40 border-white/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-white">Resend API Configuration</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Configure the API key used for sending system emails via Resend.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-zinc-300">Resend API Key</Label>
                    <div className="relative">
                        <Input
                            type="password"
                            placeholder="re_..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="bg-black/50 border-white/10 text-white pr-10 font-mono"
                        />
                        {isConfigured && (
                            <div className="absolute right-3 top-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500">
                        {isConfigured
                            ? "✅ API Key is currently configured."
                            : "⚠️ No API Key configured. Emails will fail to send."}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-300">Admin Target Email</Label>
                    <div className="relative">
                        <Input
                            type="email"
                            placeholder="support@yourdomain.com"
                            value={targetEmail}
                            onChange={(e) => setTargetEmail(e.target.value)}
                            className="bg-black/50 border-white/10 text-white pl-10"
                        />
                        <div className="absolute left-3 top-2.5">
                            <Mail className="w-5 h-5 text-zinc-500" />
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500">
                        Emails from the contact form will be sent to this address.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !apiKey}
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
