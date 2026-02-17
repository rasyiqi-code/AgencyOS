"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponsManager } from "@/components/admin/marketing/coupons-manager";
import { BonusesManager } from "@/components/admin/marketing/bonuses-manager";
import { SubscribersManager } from "@/components/admin/marketing/subscribers-manager";
import { AffiliateManager } from "@/components/admin/marketing/affiliate-manager";
import { PayoutRequests } from "@/components/admin/marketing/payout-requests";
import { AssetsManager } from "@/components/admin/marketing/assets-manager";
import { Megaphone, Tag, Gift, Users, DollarSign, Mail, FolderOpen } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="w-full py-1 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-2">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-brand-yellow" />
                        Marketing Center
                    </h1>
                    <p className="text-zinc-500 font-medium text-[10px] md:text-sm">
                        Manage discount coupons, included bonuses, and subscribers.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="coupons" className="flex-1 flex flex-col">
                <div className="mb-4 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-zinc-900/50 border border-white/5 w-max md:w-auto h-11 md:h-12 p-1 rounded-xl shadow-2xl shadow-black/20 flex items-center gap-1">
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
                            <span className="hidden md:inline">Subs</span>
                        </TabsTrigger>
                        <TabsTrigger value="assets" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest py-1.5 h-9 md:h-10 px-3 md:px-5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all shrink-0">
                            <FolderOpen className="w-4 h-4 md:w-4 md:h-4 text-brand-yellow" />
                            <span className="hidden md:inline">Assets</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="coupons" className="mt-0 outline-none focus-visible:outline-none">
                    <CouponsManager />
                </TabsContent>

                <TabsContent value="bonuses" className="mt-0 outline-none focus-visible:outline-none">
                    <BonusesManager />
                </TabsContent>

                <TabsContent value="subscribers" className="mt-0 outline-none focus-visible:outline-none">
                    <SubscribersManager />
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
