"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form state
    const [productId, setProductId] = useState("");
    const [maxActivations, setMaxActivations] = useState(1);
    const [expiresAt, setExpiresAt] = useState("");
    const [generatedKey, setGeneratedKey] = useState("");

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
            toast.success("License generated successfully");
            router.refresh();
        } catch {
            toast.error("Failed to generate license");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setGeneratedKey("");
        setProductId("");
        setMaxActivations(1);
        setExpiresAt("");
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate License
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate License Key</DialogTitle>
                </DialogHeader>

                {generatedKey ? (
                    <div className="space-y-4 py-4">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                            <p className="text-sm text-green-500 mb-1">License Key Generated!</p>
                            <p className="text-2xl font-mono font-bold tracking-wider text-green-400 select-all">
                                {generatedKey}
                            </p>
                        </div>
                        <Button className="w-full" onClick={handleClose}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Product</Label>
                            <Select value={productId} onValueChange={setProductId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} ({p.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Max Activations</Label>
                            <Input
                                type="number"
                                min="1"
                                value={maxActivations}
                                onChange={(e) => setMaxActivations(e.target.valueAsNumber)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Expiration Date (Optional)</Label>
                            <Input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || !productId}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Generate
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
