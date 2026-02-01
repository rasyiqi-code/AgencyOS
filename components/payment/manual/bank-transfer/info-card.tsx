"use client";

import { CreditCard } from "lucide-react";

interface BankTransferInfoCardProps {
    bankDetails: {
        bank_name?: string;
        bank_account?: string;
        bank_holder?: string;
    } | null;
}

export function BankTransferInfoCard({ bankDetails }: BankTransferInfoCardProps) {
    const bank = {
        name: bankDetails?.bank_name || "BCA",
        account: bankDetails?.bank_account || "123 456 7890",
        holder: bankDetails?.bank_holder || "Agency Admin"
    };

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-lime-400 font-medium">
                <CreditCard className="w-4 h-4" />
                Bank Transfer (Manual)
            </div>
            <div className="text-sm space-y-1 text-zinc-400">
                <div className="flex justify-between">
                    <span className="text-zinc-500">Bank:</span>
                    <span className="text-white">{bank.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Account:</span>
                    <span className="text-white font-mono">{bank.account}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Name:</span>
                    <span className="text-white">{bank.holder}</span>
                </div>
            </div>
        </div>
    );
}
