"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Key, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { saveResendConfig, testResendConfiguration } from "@/app/actions/system-admin";

interface Props {
    currentKey: string | null;
    currentTargetEmail: string | null;
    currentSenderName: string | null;
    currentSenderEmail: string | null;
}

export function ResendConfigForm({ currentKey, currentTargetEmail, currentSenderName, currentSenderEmail }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [apiKey, setApiKey] = useState(currentKey || "");
    const [targetEmail, setTargetEmail] = useState(currentTargetEmail || "");
    const [senderName, setSenderName] = useState(currentSenderName || "");
    const [senderEmail, setSenderEmail] = useState(currentSenderEmail || "");

    // Mask the key if it exists purely for visual purposes initially
    const isConfigured = !!currentKey;

    async function handleSave() {
        if (!apiKey) {
            toast.error("API Key is required");
            return;
        }

        setIsLoading(true);
        try {
            await saveResendConfig(apiKey, targetEmail || undefined, senderName || undefined, senderEmail || undefined);
            toast.success("Email configuration updated successfully");
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleTest() {
        setIsTesting(true);
        try {
            await testResendConfiguration(targetEmail || undefined);
            toast.success("Email test berhasil dikirim!");
        } catch (error: any) {
            toast.error(error.message || "Gagal mengirim email test");
        } finally {
            setIsTesting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="p-2 bg-white/5 rounded-lg">
                    <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Resend API Configuration</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Configure the API key used for sending system emails via Resend.
                    </p>
                </div>
            </div>
            <div className="space-y-6">
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

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Sender Name</Label>
                        <Input
                            placeholder="Crediblemark Bot"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">
                            The name displayed to recipients (e.g., Crediblemark Bot).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Sender Email</Label>
                        <Input
                            type="email"
                            placeholder="notifications@update.crediblemark.com"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-xs text-zinc-500">
                            The email address emails are sent from. Must be verified in Resend.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTest}
                        disabled={isTesting || !isConfigured}
                        className="bg-zinc-900 border-white/10 text-white hover:bg-zinc-800"
                    >
                        {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Test Email
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !apiKey}
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    );
}
