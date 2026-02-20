"use client";

import React, { useState } from "react";
import { Product } from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

interface LicenseGeneratorProps {
    products: Product[];
}

export function LicenseGenerator({ products }: LicenseGeneratorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [productId, setProductId] = useState("");
    const [maxActivations, setMaxActivations] = useState(1);
    const [expiresAt, setExpiresAt] = useState("");
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    // Bug Preventer: Radix Dialog on Next.js HMR sometimes leaves body unclickable
    React.useEffect(() => {
        document.body.style.pointerEvents = "";
        return () => {
            document.body.style.pointerEvents = "";
        };
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/licenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    maxActivations: Number(maxActivations),
                    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
                }),
            });

            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            setGeneratedKey(data.key);
            toast.success("Lisensi berhasil dibuat");
            router.refresh();
        } catch {
            toast.error("Gagal membuat lisensi");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        // Tunda sesaat agar animasi tutup tak canggung
        setTimeout(() => {
            setGeneratedKey("");
            setProductId("");
            setMaxActivations(1);
            setExpiresAt("");
        }, 300);
    }

    return (
        <Dialog modal={false}>
            <DialogTrigger className="h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 md:px-5 bg-brand-yellow text-black hover:bg-brand-yellow/90 shadow-lg shadow-brand-yellow/10 flex items-center justify-center">
                <Plus className="w-4 h-4 mr-1.5" />
                Generate Lisensi
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/5 p-4 md:p-6 shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tighter text-white">Generate Lisensi</DialogTitle>
                    <DialogDescription className="sr-only">
                        Isi form ini untuk membuat kunci lisensi baru untuk produk.
                    </DialogDescription>
                </DialogHeader>

                {generatedKey ? (
                    <div className="space-y-4 py-2">
                        <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl text-center shadow-inner shadow-green-500/5 transition-all animate-in fade-in zoom-in duration-300">
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-500/70 mb-2">Kunci Lisensi Berhasil Dibuat</p>
                            <p className="text-xl md:text-2xl font-mono font-black tracking-widest text-green-400 select-all">
                                {generatedKey}
                            </p>
                        </div>
                        <DialogClose asChild>
                            <Button
                                className="w-full h-11 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 text-[10px] font-black uppercase tracking-widest"
                                onClick={resetForm}
                            >
                                Selesai
                            </Button>
                        </DialogClose>
                    </div>
                ) : (
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Produk Target</Label>
                            <Select value={productId} onValueChange={setProductId} required>
                                <SelectTrigger className="h-10 bg-black/50 border-white/5 rounded-xl text-xs focus:ring-brand-yellow/30">
                                    <SelectValue placeholder="Pilih produk" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/5">
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id} className="text-xs uppercase font-bold tracking-tight py-2">
                                            {p.name} <span className="text-[9px] opacity-40 ml-1">[{p.type}]</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Slot Aktivasi</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={maxActivations}
                                    onChange={(e) => setMaxActivations(e.target.valueAsNumber)}
                                    className="h-10 bg-black/50 border-white/5 rounded-xl text-xs focus:border-brand-yellow/30"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Kadaluarsa (Opsional)</Label>
                                <Input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="h-10 bg-black/50 border-white/5 rounded-xl text-xs focus:border-brand-yellow/30 appearance-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-white/5">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10"
                                >
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={loading || !productId}
                                className="flex-1 h-10 rounded-xl bg-brand-yellow text-black hover:bg-brand-yellow/90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-yellow/10"
                            >
                                {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                Generate Key
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog >
    );
}
