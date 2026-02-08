import { ContactForm } from "@/components/public/contact-form";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/config/db";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await prisma.pageSeo.findUnique({
        where: { path: "/contact" }
    });

    const isId = locale === 'id';

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: "Contact Us",
            description: "Get in touch with us for your software development needs."
        };
    }

    return {
        title: (isId ? pageSeo.title_id : null) || pageSeo.title || "Contact Us",
        description: (isId ? pageSeo.description_id : null) || pageSeo.description || undefined,
        keywords: ((isId ? pageSeo.keywords_id : null) || pageSeo.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean),
        openGraph: pageSeo.ogImage ? {
            images: [{ url: pageSeo.ogImage }]
        } : undefined,
    };
}

export default async function ContactPage() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["CONTACT_EMAIL", "CONTACT_PHONE", "CONTACT_ADDRESS", "CONTACT_HOURS"] } }
    });

    const info = {
        email: settings.find(s => s.key === "CONTACT_EMAIL")?.value || null,
        phone: settings.find(s => s.key === "CONTACT_PHONE")?.value || null,
        address: settings.find(s => s.key === "CONTACT_ADDRESS")?.value || null,
        hours: settings.find(s => s.key === "CONTACT_HOURS")?.value || null,
    };

    // Fallbacks
    const email = info.email || "hello@crediblemark.com";
    const phone = info.phone || "+65 6688 8868";
    const address = info.address || "Level 39, Marina Bay Financial Centre\n10 Marina Blvd, Singapore 018983";
    const hours = info.hours || "(Mon-Fri, 9am - 6pm SGT)";

    return (
        <div className="min-h-screen bg-black selection:bg-blue-500/30">
            <div className="container mx-auto px-4 py-24 sm:py-32">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                                Get in touch
                            </h1>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                                Have a project in mind or want to learn more about our services? We&apos;d love to hear from you. Fill out the form and we&apos;ll get back to you shortly.
                            </p>
                        </div>

                        <div className="space-y-6 pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                    <Mail className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Email</h3>
                                    {email.split(',').map((e, i) => (
                                        <p key={i} className={`text-zinc-500 text-sm ${i === 0 ? "mt-1" : ""}`}>
                                            {e.trim()}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                    <MapPin className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Office</h3>
                                    <p className="text-zinc-500 text-sm mt-1 whitespace-pre-line">
                                        {address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                    <Phone className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Phone</h3>
                                    <p className="text-zinc-500 text-sm mt-1">{phone}</p>
                                    <p className="text-zinc-500 text-xs mt-1">{hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="relative">
                        {/* Decorative Gradient */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 pointer-events-none" />

                        <div className="relative rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-6 sm:p-8">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
