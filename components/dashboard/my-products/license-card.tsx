"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Check, Download } from "lucide-react";
import { regenerateLicense } from "@/app/actions/licenses";
import { toast } from "sonner";

/**
 * Props untuk LicenseCard component
 * Menampilkan informasi lisensi produk digital yang dimiliki client
 */
interface LicenseCardProps {
    license: {
        id: string;
        key: string;
        status: string;
        maxActivations: number;
        currentActivations: number;
        expiresAt: string | null;
        product: {
            id: string;
            name: string;
            type: string;
            slug: string;
            image: string | null;
            fileUrl: string | null;
            purchaseType: string;
        };
    };
}

export function LicenseCard({ license }: LicenseCardProps) {
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [currentKey, setCurrentKey] = useState(license.key);

    /** Copy license key ke clipboard */
    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentKey);
        setCopied(true);
        toast.success("License key disalin!");
        setTimeout(() => setCopied(false), 2000);
    };

    /** Regenerate license key via server action */
    const handleRegenerate = async () => {
        if (!confirm("Apakah Anda yakin ingin regenerasi license key? Key lama tidak bisa digunakan lagi.")) return;

        setRegenerating(true);
        try {
            const result = await regenerateLicense(license.id);
            if (result.success && result.license) {
                setCurrentKey(result.license.key);
                toast.success("License key berhasil di-regenerasi!");
            } else {
                toast.error(result.error || "Gagal regenerasi");
            }
        } catch {
            toast.error("Terjadi kesalahan saat regenerasi");
        } finally {
            setRegenerating(false);
        }
    };

    /** Cek apakah lisensi sudah kedaluwarsa */
    const isExpired = license.expiresAt ? new Date(license.expiresAt) < new Date() : false;

    return (
        <Card className="border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-zinc-700 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white">{license.product.name}</CardTitle>
                    <div className="flex gap-1.5">
                        <Badge
                            variant="outline"
                            className={
                                isExpired
                                    ? "border-red-500 text-red-400"
                                    : license.status === 'active'
                                        ? "border-green-500 text-green-400"
                                        : "border-zinc-500 text-zinc-400"
                            }
                        >
                            {isExpired ? "Expired" : license.status}
                        </Badge>
                        <Badge variant="outline" className="border-brand-yellow text-brand-yellow capitalize">
                            {license.product.purchaseType === 'subscription' ? 'Sub' : 'Sekali'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* License Key Display */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-2">
                    <code className="text-sm font-mono text-brand-yellow break-all">{currentKey}</code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0 text-zinc-400 hover:text-white"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-zinc-500">Aktivasi</div>
                    <div className="text-right text-zinc-300">{license.currentActivations} / {license.maxActivations}</div>

                    {license.expiresAt && (
                        <>
                            <div className="text-zinc-500">Kadaluarsa</div>
                            <div className={`text-right ${isExpired ? 'text-red-400' : 'text-zinc-300'}`}>
                                {new Date(license.expiresAt).toLocaleDateString("id-ID")}
                            </div>
                        </>
                    )}
                    <div className="text-zinc-500">Tipe Produk</div>
                    <div className="text-right text-zinc-300 capitalize">{license.product.type}</div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-3 border-t border-zinc-800">
                {/* Regenerate Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                >
                    <RefreshCw className={`w-4 h-4 mr-1.5 ${regenerating ? 'animate-spin' : ''}`} />
                    Regenerasi Key
                </Button>

                {/* Download Button (jika ada fileUrl) */}
                {license.product.fileUrl && (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/10"
                    >
                        <a href={license.product.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1.5" />
                            Download
                        </a>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
