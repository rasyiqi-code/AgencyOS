import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Bell, User } from "lucide-react";

export default async function SettingsPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                <p className="text-zinc-400 mt-1">Manage your account and subscription.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" /> Profile
                        </CardTitle>
                        <CardDescription>Your personal information managed by Stack Auth.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400 border border-blue-500/20">
                                {user.displayName?.charAt(0) || user.primaryEmail?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">{user.displayName || "User"}</h3>
                                <p className="text-zinc-500">{user.primaryEmail}</p>
                            </div>
                            <Button variant="outline" className="ml-auto" disabled>Edit Profile</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Section */}
                <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-500" /> Billing
                        </CardTitle>
                        <CardDescription>Manage your subscription and payment methods.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-300 font-medium">Current Plan: <span className="text-white font-bold">Free Tier</span></p>
                            <p className="text-xs text-zinc-500">Upgrade to Pro for more AI tokens and priority support.</p>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-500 text-white">Upgrade Plan</Button>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-yellow-500" /> Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive updates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-zinc-300">Email Alerts</span>
                            <span className="text-xs text-green-500 font-bold">ENABLED</span>
                        </div>
                        <div className="flex items-center justify-between py-2 pt-4">
                            <span className="text-sm text-zinc-300">Project Updates</span>
                            <span className="text-xs text-green-500 font-bold">ENABLED</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
