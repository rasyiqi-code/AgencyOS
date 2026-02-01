import React from 'react';
import { prisma } from "@/lib/db";

export default async function TermsPage() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["AGENCY_NAME", "COMPANY_NAME"] } }
    });
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "AgencyOS";
    const companyName = settings.find(s => s.key === "COMPANY_NAME")?.value || "AgencyOS";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 md:p-24 font-sans leading-relaxed">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4 border-b border-white/10 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Syarat & Ketentuan</h1>
                    <p className="text-zinc-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </header>

                <div className="space-y-8 text-base md:text-lg">
                    <p>
                        Syarat dan Ketentuan ini (&quot;Syarat&quot;) mengatur penggunaan Anda atas platform **{agencyName}**, layanan pengembangan software, dan produk digital yang disediakan oleh {companyName} (&quot;Kami&quot;). Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat ini.
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">1. Layanan Kami</h2>
                        <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                            <li>
                                <strong className="text-white">Pengembangan Hybrid:</strong> Kami menyediakan layanan pengembangan perangkat lunak yang menggabungkan AI Generatif dan pengawasan ahli manusia (Human Expert).
                            </li>
                            <li>
                                <strong className="text-white">Lingkup Proyek:</strong> Setiap proyek memiliki spesifikasi yang disepakati (Scope of Work). Permintaan fitur di luar scope awal mungkin dikenakan biaya tambahan.
                            </li>
                            <li>
                                <strong className="text-white">Estimasi AI:</strong> Fitur &quot;AI Quote Calculator&quot; memberikan estimasi harga awal. Harga final dikonfirmasi melalui Penawaran Resmi (Quotation) sebelum pembayaran.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">2. Pembayaran dan Pengembalian (Refund)</h2>
                        <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                            <li>
                                <strong className="text-white">Pembayaran:</strong> Layanan kami umumnya berbasis prabayar (Upfront) atau sesuai termin yang disepakati dalam Invoice. Keterlambatan pembayaran dapat menyebabkan penghentian sementara layanan.
                            </li>
                            <li>
                                <strong className="text-white">Kebijakan Refund:</strong> Karena sifat produk digital dan jasa kustom, kami <strong>tidak</strong> menawarkan pengembalian dana penuh setelah pekerjaan dimulai. Pengembalian sebagian dapat dipertimbangkan berdasarkan kebijaksanaan kami pada kasus tertentu jika hasil tidak sesuai spesifikasi fatal.
                            </li>
                            <li>
                                <strong className="text-white">Pajak:</strong> Anda bertanggung jawab atas pajak yang berlaku di yurisdiksi Anda, kecuali dinyatakan termasuk dalam invoice.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">3. Hak Kekayaan Intelektual (HAKI)</h2>
                        <p>
                            Setelah pembayaran penuh diterima:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                            <li>Anda memiliki hak penuh atas kode sumber (Source Code) dan aset produk jadi yang kami kembangkan khusus untuk Anda.</li>
                            <li>Kami berhak menggunakan komponen kode generik, library, atau &quot;{agencyName} Core&quot; yang dapat digunakan kembali untuk klien lain, tanpa melanggar kerahasiaan bisnis Anda.</li>
                            <li>Kami berhak menampilkan karya tersebut dalam portofolio kami, kecuali Anda meminta Perjanjian Kerahasiaan (NDA) tertulis.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">4. Batasan Tanggung Jawab</h2>
                        <p>
                            {agencyName} disediakan &quot;sebagaimana adanya&quot;. Kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial (seperti kehilangan keuntungan atau data) yang timbul dari penggunaan layanan kami atau gangguan server pihak ketiga (hosting/API).
                        </p>
                    </section>

                    {/* ... (skip 5 and 6 if similar structure, but I need to replace the footer) ... */}

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">5. Akun Pengguna</h2>
                        <p>
                            Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya. Kami berhak menangguhkan akun yang melanggar hukum atau merugikan integritas platform.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">6. Perubahan Syarat</h2>
                        <p>
                            Kami dapat memperbarui Syarat ini dari waktu ke waktu. Perubahan akan diberitahukan melalui email atau pemberitahuan di dashboard. Penggunaan berkelanjutan atas layanan setelah perubahan berarti Anda menerima syarat baru tersebut.
                        </p>
                    </section>
                </div>

                <footer className="pt-12 border-t border-white/10 text-sm text-zinc-500 flex justify-between">
                    <p>© {new Date().getFullYear()} {agencyName}. {companyName}.</p>
                </footer>
            </div >
        </div >
    );
}
