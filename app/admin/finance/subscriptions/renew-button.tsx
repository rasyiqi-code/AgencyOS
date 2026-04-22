"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateRenewalInvoice } from "./actions";
import { RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RenewSubscriptionButton({ 
    projectId, 
    defaultAmount, 
    currency,
    projectTitle 
}: { 
    projectId: string; 
    defaultAmount: number; 
    currency: string;
    projectTitle: string;
}) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(defaultAmount.toString());
    const [summary, setSummary] = useState(`Renewal for ${projectTitle}`);
    const [isLoading, setIsLoading] = useState(false);

    const handleRenew = async () => {
        setIsLoading(true);
        try {
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                toast.error("Please enter a valid amount.");
                return;
            }

            const result = await generateRenewalInvoice({
                projectId,
                amount: parsedAmount,
                summary
            });

            if (result.success) {
                toast.success("Renewal invoice generated successfully!");
                setOpen(false);
            } else {
                toast.error(result.error || "Failed to generate renewal invoice.");
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                    <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
                    Renew
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate Renewal Invoice</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Buat tagihan bulan berikutnya untuk klien ini. Klien akan menerima invoice baru.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Renewal Amount ({currency})</Label>
                        <Input 
                            type="number" 
                            step="0.01"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500/20"
                        />
                        <p className="text-[10px] text-zinc-500">Sesuaikan harga jika klien berhenti berlangganan sebagian Add-on.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Invoice Summary</Label>
                        <Textarea 
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500/20 resize-none h-24 text-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
                    <Button 
                        onClick={handleRenew} 
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Invoice"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
