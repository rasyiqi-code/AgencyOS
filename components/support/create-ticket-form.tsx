"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

export function CreateTicketForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/support/ticket/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: subject,
                    initialMessage: message
                })
            });

            if (!res.ok) throw new Error("Failed to create ticket");

            const data = await res.json();
            toast.success("Ticket created successfully!");
            router.push(`/dashboard/support/${data.id}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label className="text-zinc-300">Subject / Feature Request</Label>
                <Input
                    placeholder="e.g., Issue with Payment or New Feature Idea"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-300">Message</Label>
                <Textarea
                    placeholder="Explain your issue or idea in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 min-h-[150px]"
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-zinc-400 hover:text-white"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black hover:bg-zinc-200"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Submit Ticket
                </Button>
            </div>
        </form>
    );
}
