import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface MidtransMetadata {
    bank?: string;
    va_numbers?: { bank: string; va_number: string }[];
    permata_va_number?: string;
    acquirer?: string;
    store?: string;
}

export function formatPaymentMethod(type: string | null | undefined, metadata?: Record<string, unknown> | null) {
    if (!type) return "Unknown";
    const lowerType = type.toLowerCase();

    const m = metadata as MidtransMetadata | null;

    if (lowerType === 'bank_transfer') {
        if (m?.bank) return `${m.bank.toUpperCase()} VA`;
        if (m?.va_numbers?.[0]?.bank) {
            return `${m.va_numbers[0].bank.toUpperCase()} VA`;
        }
        if (m?.permata_va_number) return 'PERMATA VA';
        return 'BANK TRANSFER';
    }

    if (lowerType === 'qris') {
        const acquirer = m?.acquirer === 'gopay' ? 'GOPAY' : m?.acquirer?.toUpperCase();
        return acquirer ? `QRIS (${acquirer})` : 'QRIS';
    }

    if (lowerType === 'echannel') return 'MANDIRI BILL';
    if (lowerType === 'cstore') return `C-STORE (${m?.store?.toUpperCase() || 'ALFAMART/INDOMARET'})`;

    return type.replace(/_/g, ' ').toUpperCase();
}
