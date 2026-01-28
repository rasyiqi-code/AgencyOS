
import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 md:p-24 font-sans leading-relaxed">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white tracking-tight">Syarat dan Ketentuan (EULA)</h1>
                <p className="text-sm">Terakhir diperbarui: 28 Januari 2026</p>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Penerimaan Ketentuan</h2>
                    <p>
                        Dengan menggunakan AgencyOS, Anda setuju untuk terikat oleh ketentuan penggunaan ini.
                        Aplikasi ini disediakan sebagai alat manajemen proyek internal.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Integrasi Pihak Ketiga</h2>
                    <p>
                        AgencyOS memungkinkan integrasi dengan GitHub dan Vercel. Anda bertanggung jawab penuh atas
                        pengaturan izin dan akses yang Anda berikan melalui akun pihak ketiga Anda.
                    </p>
                </section>

                <footer className="pt-12 border-t border-white/5 text-xs">
                    <p>© 2026 AgencyOS. Semua hak dilindungi undang-undang.</p>
                </footer>
            </div>
        </div>
    );
}
