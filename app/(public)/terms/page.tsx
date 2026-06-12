import React from 'react';
import { getSystemSettings } from "@/lib/server/settings";
import { getPageSeo } from "@/lib/server/seo";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    // ⚡ Optimasi: Gunakan getPageSeo yang ter-cache (unstable_cache, TTL 1 jam)
    const pageSeo = await getPageSeo("/terms");

    const isId = locale === 'id';
    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const alternates = {
        canonical: `${baseUrl}/${locale}/terms`,
        languages: {
            'en': `${baseUrl}/en/terms`,
            'id': `${baseUrl}/id/terms`,
            'x-default': `${baseUrl}/en/terms`,
        }
    };

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: isId ? "Syarat & Ketentuan" : "Terms & Conditions",
            openGraph: {
                title: isId ? "Syarat & Ketentuan" : "Terms & Conditions",
                images: ogImages,
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: isId ? "Syarat & Ketentuan" : "Terms & Conditions",
                images: ogImages,
            },
            alternates
        };
    }

    const title = (isId ? pageSeo.title_id : null) || pageSeo.title || (isId ? "Syarat & Ketentuan" : "Terms & Conditions");
    const description = (isId ? pageSeo.description_id : null) || pageSeo.description || undefined;
    const keywords = ((isId ? pageSeo.keywords_id : null) || pageSeo.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            images: ogImages,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImages,
        },
        alternates
    };
}

export default async function TermsPage() {
    const locale = await getLocale();
    const isId = locale === 'id';

    // ⚡ Bolt Optimization: Use getSystemSettings (which utilizes unstable_cache) instead of direct prisma query.
    // 🎯 Why: Reduces redundant database queries for static system settings during SSR, mitigating the N+1 query problem.
    // 📊 Impact: Faster page load and reduced DB connections.
    const settings = await getSystemSettings(["AGENCY_NAME", "COMPANY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "AgencyOS";
    const companyName = settings.find(s => s.key === "COMPANY_NAME")?.value || "AgencyOS";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 md:p-24 font-sans leading-relaxed">
            <div className="max-w-4xl mx-auto space-y-12">
                {isId ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <header className="space-y-4 border-b border-white/10 pb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Terms & Conditions</h1>
                            <p className="text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </header>

                        <div className="space-y-8 text-base md:text-lg">
                            <p>
                                These Terms and Conditions (&quot;Terms&quot;) govern your use of the **{agencyName}** platform, software development services, and digital products provided by {companyName} (&quot;We&quot;). By accessing or using our services, you agree to be bound by these Terms.
                            </p>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">1. Our Services</h2>
                                <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                                    <li>
                                        <strong className="text-white">Hybrid Development:</strong> We provide software development services that combine Generative AI and human expert supervision.
                                    </li>
                                    <li>
                                        <strong className="text-white">Project Scope:</strong> Each project has an agreed-upon Scope of Work. Feature requests outside the initial scope may incur additional fees.
                                    </li>
                                    <li>
                                        <strong className="text-white">AI Estimation:</strong> The &quot;AI Quote Calculator&quot; feature provides an initial price estimate. The final price is confirmed via an Official Quotation before payment.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">2. Payment and Refund Policy</h2>
                                <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                                    <li>
                                        <strong className="text-white">Payment:</strong> Our services are generally prepaid (Upfront) or according to the terms agreed in the Invoice. Late payments may result in temporary service suspension.
                                    </li>
                                    <li>
                                        <strong className="text-white">Refund Policy:</strong> Due to the nature of digital products and custom services, we do <strong>not</strong> offer full refunds once work has commenced. Partial refunds may be considered at our discretion in specific cases where results fail to meet critical specifications.
                                    </li>
                                    <li>
                                        <strong className="text-white">Tax:</strong> You are responsible for applicable taxes in your jurisdiction, unless stated as included in the invoice.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">3. Intellectual Property Rights</h2>
                                <p>
                                    After full payment is received:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 marker:text-brand-yellow">
                                    <li>You have full ownership of the source code and final product assets developed specifically for you.</li>
                                    <li>We reserve the right to use generic code components, libraries, or &quot;{agencyName} Core&quot; that can be reused for other clients, without violating your business confidentiality.</li>
                                    <li>We reserve the right to showcase the work in our portfolio, unless you request a written Non-Disclosure Agreement (NDA).</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">4. Limitation of Liability</h2>
                                <p>
                                    {agencyName} is provided &quot;as is&quot;. We are not liable for indirect, incidental, or consequential damages (such as loss of profits or data) arising from the use of our services or third-party server interruptions (hosting/APIs).
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">5. User Account</h2>
                                <p>
                                    You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are entirely your responsibility. We reserve the right to suspend accounts that violate the law or harm the integrity of the platform.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">6. Changes to Terms</h2>
                                <p>
                                    We may update these Terms from time to time. Changes will be notified via email or notice on the dashboard. Continued use of the service after changes constitutes acceptance of the new terms.
                                </p>
                            </section>
                        </div>
                    </>
                )}

                <footer className="pt-12 border-t border-white/10 text-sm text-zinc-500 flex justify-between">
                    <p>© {new Date().getFullYear()} {agencyName}. {companyName}.</p>
                </footer>
            </div>
        </div>
    );
}
