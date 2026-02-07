
import { prisma } from "@/lib/config/db";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SystemNav } from "@/components/admin/system-nav";
import { Github, Globe, CheckCircle2, XCircle, Link2, Unlink } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import type { PrismaWithIntegration } from "@/types/payment";

export default async function AdminIntegrationsPage() {
    const integrations = await (prisma as unknown as PrismaWithIntegration).systemIntegration.findMany();

    const github = integrations.find((i: { provider: string }) => i.provider === "github");
    const vercel = integrations.find((i: { provider: string }) => i.provider === "vercel");

    async function disconnect(provider: string) {
        "use server";
        await (prisma as unknown as PrismaWithIntegration).systemIntegration.deleteMany({
            where: { provider }
        });
        revalidatePath("/admin/system/integrations");
    }

    return (
        <div className="w-full py-6">
            <div className="mb-8">
                <Badge variant="outline" className="text-zinc-500 border-zinc-800 uppercase tracking-widest text-[10px] mb-2">System Control</Badge>
                <h1 className="text-3xl font-bold tracking-tight text-white">System Integrations</h1>
                <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                    Connect GitHub and Vercel to enable automated workflows,
                    deployment monitoring, and source code synchronization.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <SystemNav />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* GitHub Integration */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                                    <Github className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">GitHub</h3>
                                    <p className="text-xs text-zinc-500">Repository & Commit Activity</p>
                                </div>
                            </div>
                            {github?.isActive ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                                    <XCircle className="w-3 h-3 mr-1" /> Disconnected
                                </Badge>
                            )}
                        </div>

                        {github?.isActive ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {github.metadata && typeof (github.metadata as Record<string, unknown>).avatar_url === 'string' && (
                                            <Image
                                                src={(github.metadata as Record<string, unknown>).avatar_url as string}
                                                alt=""
                                                width={32}
                                                height={32}
                                                className="rounded-full border border-white/10"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-white">{github.accountName}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono italic">ID: {github.accountId}</p>
                                        </div>
                                    </div>
                                    <form action={disconnect.bind(null, "github")}>
                                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20 gap-2">
                                            <Unlink className="w-3 h-3" /> Disconnect
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Link href="/api/integrations/github/authorize">
                                    <Button className="w-full bg-white text-black hover:bg-zinc-200 gap-2">
                                        <Link2 className="w-4 h-4" /> Connect GitHub Account
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-zinc-600 mt-3 text-center">
                                    Requires repo and read:user permissions.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Vercel Integration */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-6 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Vercel</h3>
                                    <p className="text-xs text-zinc-500">Deployment & Webhook Control</p>
                                </div>
                            </div>
                            {vercel?.isActive ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                                    <XCircle className="w-3 h-3 mr-1" /> Disconnected
                                </Badge>
                            )}
                        </div>

                        {vercel?.isActive ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white">{vercel.accountName}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono italic">
                                            {vercel.accountId?.startsWith("team_") ? "Team ID" : "User ID"}: {vercel.accountId}
                                        </p>
                                    </div>
                                    <form action={disconnect.bind(null, "vercel")}>
                                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20 gap-2">
                                            <Unlink className="w-3 h-3" /> Disconnect
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Link href="/api/integrations/vercel/authorize">
                                    <Button className="w-full bg-sky-500 text-white hover:bg-sky-600 gap-2">
                                        <Link2 className="w-4 h-4" /> Connect Vercel Account
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-zinc-600 mt-3 text-center">
                                    Enables automated deployment triggering via API.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-lg bg-blue-950/10 border border-blue-500/10">
                        <p className="text-xs text-blue-400/80 leading-relaxed">
                            <strong>Note:</strong> Integrations are system-wide. Connecting an account will
                            allow the system to use its credentials for all monitored projects.
                            Tokens are stored securely and encrypted in transit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
