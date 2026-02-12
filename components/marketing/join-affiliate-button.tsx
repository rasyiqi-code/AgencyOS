"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function JoinAffiliateButton() {
    const [loading, setLoading] = useState(false);
    const useRouterHook = useRouter();

    const handleJoin = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/marketing/affiliate/register", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to join");

            toast.success("Welcome to the Partner Program!");
            useRouterHook.push("/affiliate/dashboard");
            useRouterHook.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Activating Account..." : "Activate Partner Account"}
        </button>
    );
}
