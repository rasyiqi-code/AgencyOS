"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/marketing/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                toast.success("Berhasil berlangganan! Terima kasih.");
                setEmail("");
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal berlangganan");
            }
        } catch {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-3">
            <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Anda" 
                className="flex-1 rounded-[4px] border border-white/10 bg-black/40 px-5 py-3 text-white placeholder:text-zinc-600 focus:border-brand-yellow/50 focus:outline-none focus:ring-0 transition-all"
            />
            <button 
                type="submit"
                disabled={isLoading}
                className="rounded-[4px] bg-brand-yellow px-8 py-3 font-black text-black transition-all hover:bg-white active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "DAFTAR"}
            </button>
        </form>

    );
}
