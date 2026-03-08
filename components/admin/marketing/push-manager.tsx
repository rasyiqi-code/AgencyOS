"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PushManager() {
    const [isPending, setIsPending] = useState(false);
    const [stats, setStats] = useState({ subscribers: 0, engagement: 0 });
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        url: typeof window !== 'undefined' ? window.location.origin : "https://crediblemark.com",
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/push/stats");
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch notification stats");
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast.error("Judul dan Isi wajib diisi");
            return;
        }

        if (!confirm("Apakah Anda yakin ingin mengirim notifikasi ini ke SELURUH pelanggan?")) {
            return;
        }

        setIsPending(true);
        try {
            const res = await fetch("/api/admin/push/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Berhasil! Terkirim: ${data.successful}, Gagal/Expired: ${data.failed + data.expired}`);
                setFormData({ ...formData, title: "", body: "" });
                fetchStats(); // Update stats after broadcast
            } else {
                toast.error(data.error || "Gagal mengirim broadcast");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="w-full space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <Card className="bg-zinc-950 border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02] p-4 md:p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20 shrink-0">
                                    <Send className="w-5 h-5 md:w-6 md:h-6 text-brand-yellow" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Broadcast Message</CardTitle>
                                    <CardDescription className="text-sm text-zinc-500">Siarkan pesan Anda ke seluruh subscribers aktif.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-semibold text-zinc-400">Judul Notifikasi</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: Tips Bisnis Baru ✨"
                                        className="bg-white/5 border-white/10 rounded-xl h-12 focus-visible:ring-brand-yellow text-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="body" className="text-xs font-semibold text-zinc-400">Isi Pesan</Label>
                                    <Textarea
                                        id="body"
                                        value={formData.body}
                                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                        placeholder="Tuliskan isi pesan singkat dan menarik di sini..."
                                        className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus-visible:ring-brand-yellow text-sm font-medium leading-relaxed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="url" className="text-xs font-semibold text-zinc-400">URL Tujuan (Opsional)</Label>
                                    <Input
                                        id="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://crediblemark.com/blog/tips-1"
                                        className="bg-white/5 border-white/10 rounded-xl h-12 focus-visible:ring-brand-yellow text-sm font-medium"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-12 bg-brand-yellow text-black hover:bg-zinc-200 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_4px_20px_rgba(255,184,0,0.15)] group"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Kirim Notifikasi Sekarang
                                            <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4 order-1 lg:order-2">
                    <Card className="bg-zinc-950 border-white/10 rounded-2xl overflow-hidden">
                        <CardHeader className="p-4 bg-white/[0.02] border-b border-white/5">
                            <CardTitle className="text-xs font-bold tracking-tight text-zinc-400 flex items-center gap-2">
                                <Info className="w-4 h-4 text-brand-yellow" />
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 md:p-4 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Bell className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex items-center gap-3 border-b border-white/5 pb-2 mb-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-brand-yellow flex items-center justify-center shadow-lg shadow-brand-yellow/10">
                                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-black" />
                                    </div>
                                    <div className="text-xs font-bold text-zinc-500 tracking-tight">
                                        Browser Notification
                                    </div>
                                </div>
                                <div className="space-y-1.5 relative z-10">
                                    <div className="text-sm md:text-base font-bold text-white truncate tracking-tight">
                                        {formData.title || "Judul Notifikasi Anda"}
                                    </div>
                                    <div className="text-xs md:text-sm text-zinc-400 line-clamp-3 leading-relaxed font-medium">
                                        {formData.body || "Isi pesan akan tampil di sini saat Anda mengetiknya..."}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                                Notifikasi akan muncul sebagai native popup browser.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/40 border-white/5 rounded-2xl p-4 md:p-6">
                        <div className="space-y-4 md:space-y-6">
                            <div className="text-xs font-bold tracking-tight text-zinc-500 uppercase">Quick Stats</div>
                            <div className="grid grid-cols-2 gap-6 md:gap-8 text-center sm:text-left">
                                <div className="space-y-1 md:space-y-2">
                                    <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                        {stats.subscribers}
                                    </div>
                                    <div className="text-[9px] md:text-xs text-zinc-500 uppercase font-black tracking-widest">Subscribers</div>
                                </div>
                                <div className="space-y-1 md:space-y-2">
                                    <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                        {stats.engagement}%
                                    </div>
                                    <div className="text-[9px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest">Engagement</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
