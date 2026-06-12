"use client";

import { CreditCard, Building, Smartphone, Store, Check } from "lucide-react";
import React from "react";

interface PaymentMethod {
    id: string;
    label: string;
    type: string;
    disabled?: boolean;
}

interface PaymentMethodItemProps {
    method: PaymentMethod;
    active: boolean;
    isId: boolean;
    onSelect: () => void;
}

// Fungsi pembantu untuk deskripsi metode pembayaran yang premium dan informatif
const getMethodDescription = (id: string, isId: boolean) => {
    switch (id) {
        case "cc":
            return isId ? "Proses instan via kartu kredit/debit" : "Instant processing via credit/debit card";
        case "wise":
            return isId ? "Transfer antar-bank internasional biaya rendah" : "Low-fee international bank transfer";
        case "local_bank":
            return isId ? "Transfer manual dari rekening bank biasa (BCA, Mandiri, dll.)" : "Manual transfer to local bank account";
        case "bca":
            return "Virtual Account BCA, verifikasi otomatis";
        case "mandiri":
            return "Mandiri Bill Payment, verifikasi otomatis";
        case "bni":
            return "Virtual Account BNI, verifikasi otomatis";
        case "bri":
            return "Virtual Account BRI, verifikasi otomatis";
        case "permata":
            return "Virtual Account Permata, verifikasi otomatis";
        case "cimb":
            return "Virtual Account CIMB, verifikasi otomatis";
        case "danamon":
            return "Virtual Account Danamon, verifikasi otomatis";
        case "bsi":
            return "Virtual Account BSI, verifikasi otomatis";
        case "gopay":
            return "E-Wallet GoPay, bayar instan pakai aplikasi Gojek";
        case "shopeepay":
            return "E-Wallet ShopeePay, bayar instan pakai aplikasi Shopee";
        case "qris":
            return "Scan kode QR pakai Dana, OVO, LinkAja, GPay, dll.";
        case "indomaret":
            return "Bayar tunai secara manual di gerai Indomaret terdekat";
        case "alfamart":
            return "Bayar tunai secara manual di gerai Alfamart/Alfamidi";
        default:
            return isId ? "Metode pembayaran aman dan terverifikasi" : "Secure and verified payment method";
    }
};

export function PaymentMethodItem({ method, active, isId, onSelect }: PaymentMethodItemProps) {
    // Render ikon dinamis yang premium
    const getMethodIcon = () => {
        const iconClass = `w-4 h-4 transition-colors duration-300 ${active ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-200'}`;
        switch (method.id) {
            case "cc":
                return <CreditCard className={iconClass} />;
            case "wise":
            case "local_bank":
            case "bca":
            case "mandiri":
            case "bni":
            case "bri":
            case "permata":
            case "cimb":
            case "danamon":
            case "bsi":
                return <Building className={iconClass} />;
            case "gopay":
            case "shopeepay":
            case "qris":
                return <Smartphone className={iconClass} />;
            case "indomaret":
            case "alfamart":
                return <Store className={iconClass} />;
            default:
                return <Building className={iconClass} />;
        }
    };

    return (
        <button
            type="button"
            disabled={method.disabled}
            onClick={() => !method.disabled && onSelect()}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center justify-between group transform active:scale-[0.99] hover:scale-[1.005]
            ${method.disabled ? 'opacity-40 cursor-not-allowed bg-zinc-950/20 border-zinc-900/20' : ''}
            ${active
                    ? 'bg-gradient-to-r from-brand-yellow/[0.03] to-amber-500/[0.03] border-brand-yellow/50 shadow-[0_0_20px_rgba(254,215,0,0.08)] z-10'
                    : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Lingkaran Ikon yang Dinamis dan Glassmorphic */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border
                ${active
                        ? 'bg-gradient-to-br from-brand-yellow to-amber-500 border-brand-yellow text-black shadow-[0_0_15px_rgba(254,215,0,0.3)]'
                        : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 group-hover:border-zinc-700 group-hover:text-zinc-200'
                    }`}>
                    {getMethodIcon()}
                </div>

                <div className="space-y-0.5">
                    <div className={`text-sm font-bold tracking-wide transition-colors duration-300 
                    ${active ? 'text-brand-yellow' : 'text-zinc-100 group-hover:text-white'} 
                    ${method.disabled ? 'text-zinc-600' : ''}`}>
                        {method.label}
                    </div>
                    <div className={`text-[10px] font-medium leading-normal transition-colors duration-300
                    ${active ? 'text-brand-yellow/60' : 'text-zinc-500 group-hover:text-zinc-400'}
                    ${method.disabled ? 'text-zinc-700' : ''}`}>
                        {getMethodDescription(method.id, isId)}
                    </div>
                </div>
            </div>

            {/* Radio Button Bulat Kustom yang Menyala */}
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 
            ${active
                    ? 'border-brand-yellow bg-brand-yellow/10 shadow-[0_0_10px_rgba(254,215,0,0.2)]'
                    : 'border-zinc-700 bg-zinc-950/80 group-hover:border-zinc-500'
                }`}>
                {active && (
                    <div className="w-2 h-2 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(254,215,0,1)] flex items-center justify-center">
                        <Check className="w-1.5 h-1.5 text-black stroke-[3.5]" />
                    </div>
                )}
            </div>
        </button>
    );
}
