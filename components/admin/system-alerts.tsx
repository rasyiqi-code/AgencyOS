import { AlertTriangle, Key, CreditCard, ArrowRight } from "lucide-react";
import { isAIConfigured } from "@/src/server/ai";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";

export async function SystemAlerts() {
    // Memeriksa status AI dan Gateway Pembayaran secara paralel
    const [aiConfigured, gatewayConfigured] = await Promise.all([
        isAIConfigured(),
        paymentGatewayService.hasActiveGateway()
    ]);

    // Jika semua sudah dikonfigurasi dengan benar, tidak perlu menampilkan peringatan
    if (aiConfigured && gatewayConfigured) {
        return null;
    }

    return (
        <div className="w-full bg-amber-950/10 border border-amber-500/20 rounded-2xl p-5 mb-6 backdrop-blur-md shadow-xl shadow-amber-950/5">
            {/* Header Box Peringatan */}
            <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-amber-500 tracking-wide">
                        Konfigurasi Sistem Belum Lengkap
                    </h2>
                    <p className="text-xs text-amber-500/60 mt-0.5">
                        Beberapa fitur penting dinonaktifkan atau berjalan dalam mode terbatas. Harap selesaikan konfigurasi di bawah ini.
                    </p>
                </div>
            </div>

            {/* Daftar Peringatan */}
            <div className="flex flex-col gap-4">
                {/* Peringatan AI API Key */}
                {!aiConfigured && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:border-amber-500/20 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5 shrink-0">
                                <Key className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-500">
                                    Google AI API Key Belum Aktif
                                </h3>
                                <p className="text-xs text-amber-500/70 mt-1 leading-relaxed">
                                    Fitur Customer Support dan Price Estimator saat ini <strong>offline</strong> untuk pelanggan karena tidak ada Google AI API Key yang aktif di sistem.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 self-end sm:self-center">
                            <a
                                href="/admin/system/keys"
                                className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20"
                            >
                                Atur AI Key
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Peringatan Payment Gateway */}
                {!gatewayConfigured && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:border-amber-500/20 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5 shrink-0">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-500">
                                    Gateway Pembayaran Belum Aktif
                                </h3>
                                <p className="text-xs text-amber-500/70 mt-1 leading-relaxed">
                                    Midtrans atau Creem belum dikonfigurasi secara lengkap. Pelanggan akan dialihkan ke metode pembayaran <strong>transfer bank manual</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 self-end sm:self-center">
                            <a
                                href="/admin/system/payment"
                                className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20"
                            >
                                Atur Gateway
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
