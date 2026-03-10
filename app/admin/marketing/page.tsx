"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponsManager } from "@/components/admin/marketing/coupons-manager";
import { BonusesManager } from "@/components/admin/marketing/bonuses-manager";
import { SubscribersManager } from "@/components/admin/marketing/subscribers-manager";
import { AffiliateManager } from "@/components/admin/marketing/affiliate-manager";
import { PayoutRequests } from "@/components/admin/marketing/payout-requests";
import { AssetsManager } from "@/components/admin/marketing/assets-manager";
import { PopUpsManager } from "@/components/admin/marketing/popups-manager";
import { LeadsManager } from "@/components/admin/marketing/leads-manager";
import { Megaphone, Tag, Gift, Users, DollarSign, Mail, FolderOpen, LayoutTemplate, UserPlus, Bell } from "lucide-react";
import { PushManager } from "@/components/admin/marketing/push-manager";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

export default function MarketingPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading Marketing Center...</div>}>
            <MarketingContent />
        </Suspense>
    );
}

function MarketingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get("tab") || "popups";

    const handleTabChange = (value: string) => {
        router.push(`/admin/marketing?tab=${value}`, { scroll: false });
    };

    return (
        <div className="w-full min-w-0 max-w-full py-1 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-brand-yellow" />
                        Marketing Center
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Campaigns, promotions, and engagement tools.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-w-0">
                <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="overflow-x-auto no-scrollbar pb-2">
                        <TabsList className="bg-zinc-900/50 border border-white/5 inline-flex w-max min-w-full sm:min-w-0 h-11 md:h-12 p-1 rounded-xl shadow-2xl shadow-black/20 items-center justify-start gap-1">
                            <TabsTrigger value="popups" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <LayoutTemplate className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">PopUps</span>
                            </TabsTrigger>
                            <TabsTrigger value="leads" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <UserPlus className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Leads</span>
                            </TabsTrigger>
                            <TabsTrigger value="coupons" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <Tag className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Coupons</span>
                            </TabsTrigger>
                            <TabsTrigger value="bonuses" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <Gift className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Bonuses</span>
                            </TabsTrigger>
                            <TabsTrigger value="affiliates" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <Users className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Partners</span>
                            </TabsTrigger>
                            <TabsTrigger value="payouts" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <DollarSign className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Payouts</span>
                            </TabsTrigger>
                            <TabsTrigger value="subscribers" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <Mail className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Emails</span>
                            </TabsTrigger>
                            <TabsTrigger value="push" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <Bell className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Push</span>
                            </TabsTrigger>
                            <TabsTrigger value="assets" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                                <FolderOpen className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                                <span className="hidden md:inline">Assets</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="popups" className="mt-0 outline-none focus-visible:outline-none">
                    <PopUpsManager />
                </TabsContent>

                <TabsContent value="leads" className="mt-0 outline-none focus-visible:outline-none">
                    <LeadsManager />
                </TabsContent>

                <TabsContent value="coupons" className="mt-0 outline-none focus-visible:outline-none">
                    <CouponsManager />
                </TabsContent>

                <TabsContent value="bonuses" className="mt-0 outline-none focus-visible:outline-none">
                    <BonusesManager />
                </TabsContent>

                <TabsContent value="subscribers" className="mt-0 outline-none focus-visible:outline-none">
                    <SubscribersManager />
                </TabsContent>

                <TabsContent value="push" className="mt-0 outline-none focus-visible:outline-none">
                    <PushManager />
                </TabsContent>

                <TabsContent value="affiliates" className="mt-0 outline-none focus-visible:outline-none">
                    <AffiliateManager />
                </TabsContent>

                <TabsContent value="payouts" className="mt-0 outline-none focus-visible:outline-none">
                    <PayoutRequests />
                </TabsContent>

                <TabsContent value="assets" className="mt-0 outline-none focus-visible:outline-none">
                    <AssetsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
