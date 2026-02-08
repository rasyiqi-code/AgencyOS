"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, DollarSign, Wallet } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface PayoutRequestFormProps {
    availableBalance: number;
}

export function PayoutRequestForm({ availableBalance }: PayoutRequestFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("bank_transfer");
    const [accountDetails, setAccountDetails] = useState("");

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const requestedAmount = parseFloat(amount);
            if (isNaN(requestedAmount) || requestedAmount <= 0) {
                toast.error("Invalid amount");
                return;
            }
            if (requestedAmount > availableBalance) {
                toast.error("Insufficient balance");
                return;
            }

            const response = await fetch("/api/squad/payout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: requestedAmount,
                    method,
                    details: { account: accountDetails }
                })
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Payout request submitted!");
                setOpen(false);
                setAmount("");
                // Ideally refresh the page or update local state
                window.location.reload();
            } else {
                toast.error(result.error || "Failed to submit request");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-brand-yellow text-black font-bold hover:bg-brand-yellow/90 flex items-center gap-2" disabled={availableBalance <= 0}>
                    <DollarSign className="w-4 h-4" /> Request Payout
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:max-w-md rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-brand-yellow" /> Request Payout
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Withdraw your earnings to your preferred account.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                        <Label className="text-zinc-500 text-xs uppercase font-bold">Available Balance</Label>
                        <div className="text-2xl font-mono text-white font-bold mt-1">
                            ${availableBalance.toFixed(2)}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300 font-medium">Amount ($)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            max={availableBalance}
                            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-brand-yellow"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300 font-medium">Withdrawal Method</Label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                        >
                            <option value="bank_transfer">Bank Transfer (Manual)</option>
                            <option value="wise">Wise</option>
                            <option value="crypto">Crypto (USDC/USDT)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300 font-medium">Account Details</Label>
                        <Input
                            value={accountDetails}
                            onChange={(e) => setAccountDetails(e.target.value)}
                            placeholder="Bank Name, Account Number, Holder Name"
                            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-brand-yellow"
                        />
                        <p className="text-xs text-zinc-500">Provide complete details for manual processing.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !amount || !accountDetails} className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
                        Confirm Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
