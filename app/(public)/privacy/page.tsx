
import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 md:p-24 font-sans leading-relaxed">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white tracking-tight">Kebijakan Privasi</h1>
                <p className="text-sm">Terakhir diperbarui: 28 Januari 2026</p>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Informasi yang Kami Kumpulkan</h2>
                    <p>
                        Aplikasi AgencyOS mengumpulkan informasi minimal yang diperlukan untuk menyediakan layanan manajemen proyek
                        dan integrasi teknis. Ini termasuk alamat email, nama tampilan, dan token otorisasi dari layanan pihak ketiga
                        seperti GitHub dan Vercel.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Penggunaan Informasi</h2>
                    <p>
                        Informasi yang dikumpulkan hanya digunakan untuk:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Mengelola akun dan profil Anda.</li>
                        <li>Mengaktifkan monitoring aktivitas repository GitHub.</li>
                        <li>Memfasilitasi alur deployment melalui integrasi Vercel.</li>
                        <li>Menyediakan pembaruan status proyek secara real-time.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Keamanan Data</h2>
                    <p>
                        Kami memprioritaskan keamanan data Anda. Token akses disimpan dengan enkripsi di database kami dan
                        hanya digunakan untuk keperluan fungsionalitas aplikasi yang Anda setujui.
                    </p>
                </section>

                <footer className="pt-12 border-t border-white/5 text-xs">
                    <p>© 2026 AgencyOS. Semua hak dilindungi undang-undang.</p>
                </footer>
            </div>
        </div>
    );
}
