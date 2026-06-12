import { prisma } from "@/lib/config/db";
import { CheckCircle2, XCircle, ShieldCheck, Calendar, DollarSign, User, Hash } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getSettingValue } from "@/lib/server/settings";
import { getTranslations, getLocale } from "next-intl/server";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const t = await getTranslations("Verify");
    const agencyName = await getSettingValue("AGENCY_NAME", "Agency OS");
    
    return {
        title: t("metaTitle", { id: id.slice(-8).toUpperCase(), brand: agencyName }),
        description: t("metaDesc", { brand: agencyName }),
    };
}

export default async function VerifyInvoicePage({ params }: PageProps) {
    const { id } = await params;
    const t = await getTranslations("Verify");
    const locale = await getLocale();

    const [estimate, agencyName] = await Promise.all([
        prisma.estimate.findUnique({
            where: { id },
            include: {
                project: true,
                service: true
            }
        }),
        getSettingValue("AGENCY_NAME", "Agency OS")
    ]);

    const isVerified = !!estimate;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#312e81,transparent_50%)] opacity-30" />
            
            <div className="relative w-full max-w-xl">
                {/* Status Card */}
                <div className={`rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl ${isVerified ? 'bg-zinc-900/50' : 'bg-red-950/20'}`}>
                    {/* Header Banner */}
                    <div className={`h-2 w-full ${isVerified ? 'bg-indigo-500' : 'bg-red-500'}`} />
                    
                    <div className="p-8 md:p-12 text-center">
                        {isVerified ? (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <ShieldCheck className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">{t("verifiedTitle")}</h1>
                                <p className="text-zinc-400 mb-8 max-w-sm">
                                    {t("verifiedDesc", { brand: agencyName })}
                                </p>
                                
                                {/* Info Grid */}
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                                            <Hash className="w-3 h-3" />
                                            {t("invoiceId")}
                                        </div>
                                        <div className="font-mono text-sm">#{estimate.id.toUpperCase()}</div>
                                    </div>
                                    
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                                            <Calendar className="w-3 h-3" />
                                            {t("dateIssued")}
                                        </div>
                                        <div className="font-medium text-sm">
                                            {new Date(estimate.createdAt).toLocaleDateString(locale, { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
 
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                                            <User className="w-3 h-3" />
                                            {t("client")}
                                        </div>
                                        <div className="font-medium text-sm">{estimate.project?.clientName || "Valued Client"}</div>
                                    </div>
 
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest mb-1">
                                            <DollarSign className="w-3 h-3" />
                                            {t("totalAmount")}
                                        </div>
                                        <div className="font-bold text-lg text-indigo-400">
                                            {new Intl.NumberFormat(locale, { 
                                                style: 'currency', 
                                                currency: estimate.service?.currency || 'USD' 
                                            }).format(estimate.totalCost)}
                                        </div>
                                    </div>
                                </div>
 
                                <div className="mt-8 pt-8 border-t border-white/5 w-full text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        {t("signedBy", { brand: agencyName })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                    <XCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">{t("failedTitle")}</h1>
                                <p className="text-zinc-400 mb-8 max-w-sm">
                                    {t("failedDesc")}
                                </p>
                                
                                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 w-full mb-8">
                                    <div className="text-red-400 text-sm font-medium mb-1 uppercase tracking-widest">{t("invalidId")}</div>
                                    <div className="font-mono text-xs opacity-50 break-all">{id}</div>
                                </div>
 
                                <Link 
                                    href="/contact"
                                    className="px-8 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
                                >
                                    {t("contactSupport")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
 
                {/* Footer Branding */}
                <div className="mt-8 flex flex-col items-center gap-4 opacity-50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                            <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
                        </div>
                        <span className="font-bold tracking-tight">{agencyName}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em]">{t("portalTitle")}</p>
                </div>
            </div>
        </div>
    );
}
