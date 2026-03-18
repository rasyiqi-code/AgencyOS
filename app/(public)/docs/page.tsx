import React from 'react';
import { prisma } from "@/lib/config/db";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";
import { Key, Share2, ShieldCheck, Layers, Cpu, ArrowLeft, ExternalLink } from "lucide-react";
import { SaaSSnippets } from "@/components/public/docs/saas-snippets";
import { LicenseSnippets } from "@/components/public/docs/license-snippets";
import { CopySectionButton } from "@/components/public/docs/copy-section-button";
import { CopyAllButton } from "@/components/public/docs/copy-all-button";
import { WEBHOOK_PAYLOAD, SAAS_SNIPPETS, LICENSE_SNIPPETS } from "@/components/public/docs/constants";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const isId = locale === 'id';
    
    return {
        title: isId ? "Dokumentasi Integrasi - AgencyOS" : "Integration Documentation - AgencyOS",
        description: isId 
            ? "Pilih jalur integrasi produk Anda: SaaS Subscription atau Lisensi Digital mandiri." 
            : "Choose your product integration path: SaaS Subscription or standalone Digital License.",
    };
}

export default async function DocumentationPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ type?: string }> 
}) {
    const locale = await getLocale();
    const isId = locale === 'id';
    const params = await searchParams;
    const type = params.type;

    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["COMPANY_NAME"] } }
    });
    const companyName = settings.find(s => s.key === "COMPANY_NAME")?.value || "AgencyOS";
    const webhookPayload = WEBHOOK_PAYLOAD;

    // Build Full Documentation Markdown for Copy All
    const buildFullDocs = () => {
        const title = type === 'saas' ? "SaaS & Subscription Integration" : "Licensed Product Verification";
        const specificContent = type === 'saas' 
            ? `## SaaS Integration\nEndpoint: GET /api/v1/subscription/check?email=USER_EMAIL&productSlug=YOUR_SLUG\n\n### Snippets\n\n#### Next.js\n\`\`\`typescript\n${SAAS_SNIPPETS.nextjs}\n\`\`\`\n\n#### Python\n\`\`\`python\n${SAAS_SNIPPETS.python}\n\`\`\``
            : `## License Verification\nEndpoint: POST /api/public/verify-license\n\n### Snippets\n\n#### Next.js\n\`\`\`typescript\n${LICENSE_SNIPPETS.nextjs}\n\`\`\`\n\n#### Python\n\`\`\`python\n${LICENSE_SNIPPETS.python}\n\`\`\``;

        return `# ${title}\n\n## 1. Webhook Payload\n\`\`\`json\n${webhookPayload}\n\`\`\`\n\n${specificContent}\n\n## 3. Architecture\nSupported aliases: productSlug, productId, product_slug.`;
    };

    const fullDocumentation = buildFullDocs();

    // Selector Portal State
    if (!type || (type !== 'saas' && type !== 'license')) {
        return (
             <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-brand-yellow/30 flex flex-col items-center justify-center py-20 px-6">
                <div className="container mx-auto max-w-5xl text-center space-y-12">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[10px] font-bold uppercase tracking-widest mx-auto">
                            <ShieldCheck className="w-3 h-3" /> Developer Portal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                            {isId ? "Pilih Jalur Integrasi" : "Choose Integration Path"}
                        </h1>
                        <p className="text-lg text-zinc-500 leading-relaxed">
                            {isId 
                                ? "Siapkan sistem aktivasi Anda dalam hitungan menit. Pilih jenis produk yang ingin Anda hubungkan." 
                                : "Get your activation system ready in minutes. Choose the type of product you want to connect."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {/* SaaS Card */}
                        <a 
                            href={`/${locale}/docs?type=saas`}
                            className="group p-10 rounded-[40px] bg-zinc-900/40 border border-white/5 hover:border-brand-yellow/30 hover:bg-zinc-900/60 transition-all duration-500 space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Cpu className="w-32 h-32 text-brand-yellow" />
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Cpu className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white group-hover:text-brand-yellow transition-colors">{isId ? "SaaS & Langganan" : "SaaS & Subscription"}</h2>
                                <p className="text-zinc-500 leading-relaxed">
                                    {isId 
                                        ? "Gunakan ini jika produk Anda berbasis langganan bulanan/tahunan. Verifikasi akses user secara real-time via API." 
                                        : "Use this if your product is subscription-based. Verify user access in real-time via our robust API."}
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
                                {isId ? "Buka Dokumentasi" : "Open Documentation"} <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                            </div>
                        </a>

                        {/* License Card */}
                        <a 
                            href={`/${locale}/docs?type=license`}
                            className="group p-10 rounded-[40px] bg-zinc-900/40 border border-white/5 hover:border-brand-yellow/30 hover:bg-zinc-900/60 transition-all duration-500 space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Key className="w-32 h-32 text-brand-yellow" />
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Key className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white group-hover:text-brand-yellow transition-colors">{isId ? "Produk Digital Berlisensi" : "Licensed Digital Product"}</h2>
                                <p className="text-zinc-500 leading-relaxed">
                                    {isId 
                                        ? "Gunakan ini untuk Plugin, Theme, Software, atau APK yang membutuhkan verifikasi License Key mandiri." 
                                        : "Use this for Plugins, Themes, Software, or apps that require standalone License Key verification."}
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
                                {isId ? "Buka Dokumentasi" : "Open Documentation"} <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Guide State
    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-brand-yellow/30 pb-24">
            {/* Guide Header */}
            <div className="border-b border-white/5 py-12 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <a 
                            href={`/${locale}/docs`}
                            className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </a>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                {type === 'saas' 
                                    ? (isId ? "Integrasi SaaS & Langganan" : "SaaS & Subscription Integration")
                                    : (isId ? "Verifikasi Produk Berlisensi" : "Licensed Product Verification")}
                            </h1>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-[0.2em] mt-1">
                                {isId ? "Halaman Dokumentasi" : "Documentation Guide"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CopyAllButton isId={isId} content={fullDocumentation} />
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sticky Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0 sticky top-40 self-start space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 px-1">
                                {isId ? "Daftar Isi" : "Table of Contents"}
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {[
                                    { id: 'webhook', label: '1. Webhook Payload' },
                                    { id: type === 'saas' ? 'saas' : 'license', label: type === 'saas' ? '2. SaaS Docs' : '2. License Docs' },
                                    { id: 'architecture', label: '3. Architecture' }
                                ].map(link => (
                                    <a 
                                        key={link.id} 
                                        href={`#${link.id}`}
                                        className="text-sm font-medium text-zinc-500 hover:text-white transition-colors py-1 block border-l border-white/5 pl-4 hover:border-brand-yellow/50"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0 space-y-32">
                        
                        {/* Webhook Guide */}
                        <section id="webhook" className="scroll-mt-48 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-brand-yellow text-xs font-bold uppercase tracking-widest mb-1">
                                        <Share2 className="w-3 h-3" /> Outgoing
                                    </div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{isId ? "1. Payload Webhook" : "1. Webhook Payload"}</h2>
                                    <p className="text-zinc-400 leading-relaxed text-lg">
                                        {isId 
                                            ? "Payload berikut dikirim via POST ke URL produk Anda untuk memberitahu jika ada pembelian atau aktivasi." 
                                            : "The following payload is sent via POST to your product URL to notify you of purchases or activations."}
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    <CopySectionButton 
                                        isId={isId} 
                                        title={isId ? "Payload Webhook" : "Webhook Payload"} 
                                        content={isId 
                                            ? "Payload dikirim via POST ke externalWebhookUrl produk Anda.\n\n" + webhookPayload
                                            : "Payload sent via POST to your product's externalWebhookUrl.\n\n" + webhookPayload
                                        } 
                                    />
                                </div>
                            </div>

                            <div className="bg-black p-8 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                <pre className="text-xs md:text-sm font-mono text-zinc-400 overflow-x-auto selection:bg-brand-yellow/20 leading-relaxed">
                                    {webhookPayload}
                                </pre>
                            </div>
                        </section>

                        {/* Conditional Specific Guide */}
                        {type === 'saas' ? (
                            <section id="saas" className="scroll-mt-48 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            <Cpu className="w-3 h-3" /> SaaS / Subscription
                                        </div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{isId ? "2. Panduan Integrasi SaaS" : "2. SaaS Integration Guide"}</h2>
                                        <p className="text-zinc-400 leading-relaxed text-lg">
                                            {isId 
                                                ? "Untuk model langganan, verifikasi akses user menggunakan endpoint check subscription kami." 
                                                : "For subscription models, verify user access using our check subscription endpoint."}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        <CopySectionButton 
                                            isId={isId} 
                                            title={isId ? "Integrasi SaaS" : "SaaS Integration"} 
                                            content={isId 
                                                ? "Gunakan endpoint ini untuk cek status langganan SaaS:\nGET /api/v1/subscription/check?email=USER_EMAIL&productSlug=YOUR_SLUG"
                                                : "Use this endpoint to check SaaS subscription status:\nGET /api/v1/subscription/check?email=USER_EMAIL&productSlug=YOUR_SLUG"
                                            } 
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-3">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Main Endpoint</div>
                                    <code className="text-xs bg-black/40 p-4 rounded-xl block text-emerald-300">GET /api/v1/subscription/check?email=USER_EMAIL&productSlug=YOUR_SLUG</code>
                                </div>

                                <SaaSSnippets isId={isId} />
                            </section>
                        ) : (
                            <section id="license" className="scroll-mt-48 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            <Key className="w-3 h-3" /> Standalone License
                                        </div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{isId ? "3. Verifikasi Lisensi Produk" : "3. Product License Verification"}</h2>
                                        <p className="text-zinc-400 leading-relaxed text-lg">
                                            {isId 
                                                ? "Gunakan ini untuk aplikasi digital, plugin, atau software yang membutuhkan aktivasi kunci lisensi." 
                                                : "Use this for digital apps, plugins, or software that require license key activation."}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        <CopySectionButton 
                                            isId={isId} 
                                            title={isId ? "Verifikasi Lisensi" : "License Verification"} 
                                            content={isId 
                                                ? "Gunakan endpoint ini untuk memverifikasi lisensi:\nPOST /api/public/verify-license"
                                                : "Use this endpoint to verify license keys:\nPOST /api/public/verify-license"
                                            } 
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-3">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verification Endpoint</div>
                                    <code className="text-xs bg-black/40 p-4 rounded-xl block text-blue-300">POST /api/public/verify-license</code>
                                </div>

                                <LicenseSnippets isId={isId} />
                            </section>
                        )}

                        {/* Flexibility Check */}
                        <section id="architecture" className="scroll-mt-48 p-10 rounded-3xl bg-zinc-950 border border-white/5 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
                                        <Layers className="w-3 h-3" /> Architecture
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{isId ? "Nomenklatur & Kompatibilitas" : "Nomenclature & Compatibility"}</h2>
                                    <p className="text-zinc-500 leading-relaxed max-w-2xl">
                                        {isId 
                                            ? "Untuk memudahkan transisi sistem, API kami mengenali berbagai alias parameter untuk identitas produk." 
                                            : "To facilitate system transition, our API recognizes various parameter aliases for product identity."}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <CopySectionButton 
                                        isId={isId} 
                                        title={isId ? "Arsitektur & Kompatibilitas" : "Architecture & Compatibility"} 
                                        content={isId 
                                            ? "Alias parameter produk yang didukung: productSlug, productId, product_slug."
                                            : "Supported product parameter aliases: productSlug, productId, product_slug."
                                        } 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {['productSlug', 'productId', 'product_slug'].map(p => (
                                    <code key={p} className="px-4 py-2 rounded-xl bg-zinc-900 text-sm text-zinc-300 border border-white/5 font-mono">{p}</code>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <div className="pt-16 pb-32 border-t border-white/5">
                            <div className="p-12 rounded-[40px] bg-brand-yellow text-black flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight leading-none">
                                        {isId ? "Butuh Bimbingan?" : "Need Guidance?"}
                                    </h2>
                                    <p className="text-black/60 text-sm font-medium">
                                        {isId 
                                            ? "Engineering team kami siap membantu integrasi Anda." 
                                            : "Our engineering team is ready to help your integration."}
                                    </p>
                                </div>
                                <a 
                                    href={`/${locale}/contact`}
                                    className="h-14 px-10 inline-flex items-center justify-center rounded-2xl bg-black text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-xl"
                                >
                                    {isId ? "Hubungi Support" : "Contact Support"}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-32 py-12 border-t border-white/5 opacity-40">
                <div className="container mx-auto px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <p>© {new Date().getFullYear()} {companyName}</p>
                    <div className="flex gap-8">
                        <a href={`/${locale}/terms`} className="hover:text-white">Terms</a>
                        <a href={`/${locale}/privacy`} className="hover:text-white">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
