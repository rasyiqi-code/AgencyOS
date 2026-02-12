"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponsManager } from "@/components/admin/marketing/coupons-manager";
import { BonusesManager } from "@/components/admin/marketing/bonuses-manager";
import { SubscribersManager } from "@/components/admin/marketing/subscribers-manager";
import { AffiliateManager } from "@/components/admin/marketing/affiliate-manager";
import { PayoutRequests } from "@/components/admin/marketing/payout-requests";
import { AssetsManager } from "@/components/admin/marketing/assets-manager";
import { Megaphone } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Megaphone className="w-8 h-8 text-brand-yellow" />
                        Marketing Center
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Manage discount coupons, included bonuses, and subscribers.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="coupons" className="space-y-4">
                <TabsList className="bg-zinc-900/50 border border-white/5">
                    <TabsTrigger value="coupons">Coupons</TabsTrigger>
                    <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
                    <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                    <TabsTrigger value="assets">Assets & Materials</TabsTrigger>
                </TabsList>

                <TabsContent value="coupons" className="space-y-4">
                    <CouponsManager />
                </TabsContent>

                <TabsContent value="bonuses" className="space-y-4">
                    <BonusesManager />
                </TabsContent>

                <TabsContent value="subscribers" className="space-y-4">
                    <SubscribersManager />
                </TabsContent>

                <TabsContent value="affiliates" className="space-y-4">
                    <AffiliateManager />
                </TabsContent>

                <TabsContent value="payouts" className="space-y-4">
                    <PayoutRequests />
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                    <AssetsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
