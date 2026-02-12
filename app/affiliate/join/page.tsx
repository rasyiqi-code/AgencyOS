import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { redirect } from "next/navigation";
import { JoinAffiliateButton } from "@/components/marketing/join-affiliate-button";
import {
    DollarSign, BarChart3, Zap, Share2, ArrowRight,
    CheckCircle, MousePointerClick, ShoppingCart, Wallet
} from "lucide-react";

export default async function AffiliateJoinPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in?returnTo=/affiliate/join');
    }

    const existingProfile = await prisma.affiliateProfile.findUnique({
        where: { userId: user.id }
    });

    if (existingProfile) {
        redirect('/affiliate/dashboard');
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
                {/* Gradient background orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-yellow/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-4 py-1.5 text-sm text-brand-yellow font-medium">
                        <Zap className="w-4 h-4" />
                        Partner Program
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                        <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                            Earn While You
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-brand-yellow to-amber-400 bg-clip-text text-transparent">
                            Share & Grow
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
                        Join our partner program and earn <strong className="text-white">10% commission</strong> on every
                        project you refer. No limits, no hidden fees.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <JoinAffiliateButton />
                        <a href="#how-it-works" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                            Learn how it works <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats Highlight */}
            <section className="py-16 px-6 border-y border-zinc-800/50">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: "10%", label: "Commission Rate" },
                        { value: "$50", label: "Min. Payout" },
                        { value: "30 days", label: "Cookie Duration" },
                        { value: "∞", label: "Earning Potential" },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Partner With Us?</h2>
                        <p className="text-zinc-400 max-w-lg mx-auto">
                            Everything you need to monetize your network with zero upfront investment.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: DollarSign,
                                title: "High Commission",
                                desc: "Earn 10% on every closed deal. Average commission on premium projects can reach $500+.",
                                color: "text-emerald-500",
                                bg: "bg-emerald-500/10 border-emerald-500/20"
                            },
                            {
                                icon: BarChart3,
                                title: "Real-time Dashboard",
                                desc: "Monitor clicks, conversions, and earnings from your personal partner dashboard.",
                                color: "text-blue-500",
                                bg: "bg-blue-500/10 border-blue-500/20"
                            },
                            {
                                icon: Wallet,
                                title: "Fast Payouts",
                                desc: "Request payouts anytime when you reach $50 minimum. Processed quickly via bank transfer.",
                                color: "text-purple-500",
                                bg: "bg-purple-500/10 border-purple-500/20"
                            },
                        ].map((item, i) => (
                            <div key={i} className={`p-6 rounded-2xl border backdrop-blur ${item.bg} transition-transform hover:scale-[1.02]`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${item.bg}`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <h3 className="font-semibold text-white mb-2 text-lg">{item.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 px-6 bg-zinc-950/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-zinc-400">Three simple steps to start earning.</p>
                    </div>
                    <div className="space-y-0">
                        {[
                            {
                                step: "01",
                                icon: Share2,
                                title: "Share Your Link",
                                desc: "Get your unique referral link and share it with your network via social media, email, or website."
                            },
                            {
                                step: "02",
                                icon: MousePointerClick,
                                title: "Visitors Click & Explore",
                                desc: "When someone clicks your link, a 30-day tracking cookie is set. Any purchase within that window counts."
                            },
                            {
                                step: "03",
                                icon: ShoppingCart,
                                title: "They Book a Project",
                                desc: "When your referred visitor books and pays for a project, you automatically earn 10% commission."
                            },
                            {
                                step: "04",
                                icon: Wallet,
                                title: "Get Paid",
                                desc: "Track your earnings on the dashboard and request payouts anytime once you hit the minimum threshold."
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 py-8 border-b border-zinc-800/50 last:border-0 group">
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-brand-yellow/30 transition-colors">
                                        <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-brand-yellow transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-brand-yellow/60 mb-1">Step {item.step}</div>
                                    <h3 className="font-semibold text-white text-lg mb-1">{item.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Ready to Start Earning?
                    </h2>
                    <p className="text-zinc-400">
                        It&apos;s free to join. No commitments, no minimum requirements. Just share and earn.
                    </p>
                    <div className="flex flex-col items-center gap-3">
                        <JoinAffiliateButton />
                        <div className="flex items-center gap-4 text-xs text-zinc-600 mt-2">
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Free to join</span>
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> No minimum sales</span>
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Instant setup</span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-700 pt-4">
                        By joining, you agree to our Affiliate Terms & Conditions.
                    </p>
                </div>
            </section>
        </div>
    );
}
