import { prisma } from "@/lib/config/db";
import { canManageBilling } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Repeat, CheckCircle2, AlertCircle } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { RenewSubscriptionButton } from "./renew-button";

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
    const hasAccess = await canManageBilling();
    if (!hasAccess) {
        redirect("/admin");
    }

    // Ambil project yang memiliki status subscription
    const projects = await prisma.project.findMany({
        where: {
            subscriptionStatus: { not: null }
        },
        include: {
            service: true,
            estimate: true
        },
        orderBy: { subscriptionEndsAt: 'asc' }
    });

    const now = new Date();

    return (
        <div className="w-full py-6 sm:py-10 space-y-8 animate-in fade-in duration-700">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Repeat className="w-8 h-8 text-blue-500" />
                    Subscriptions
                </h1>
                <p className="text-zinc-400 mt-1 text-sm max-w-2xl leading-relaxed">
                    Kelola siklus langganan bulanan atau tahunan dari klien Anda.
                </p>
            </header>

            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl rounded-3xl relative">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="z-20 bg-zinc-900/90 backdrop-blur-md border-zinc-800/50">
                                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Project</TableHead>
                                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Client</TableHead>
                                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Status</TableHead>
                                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Renewal Date</TableHead>
                                    <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6 text-right">Last Bill</TableHead>
                                    <TableHead className="text-center text-zinc-500 text-[10px] uppercase font-bold tracking-widest py-4 px-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.length === 0 && (
                                    <TableRow className="border-zinc-800/50">
                                        <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                                            Belum ada langganan aktif.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {projects.map((project) => {
                                    const isExpired = project.subscriptionEndsAt && new Date(project.subscriptionEndsAt) < now;
                                    const isExpiringSoon = project.subscriptionEndsAt && !isExpired && 
                                        (new Date(project.subscriptionEndsAt).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000); // 7 days

                                    type ServiceData = { interval?: string, price: number, currency?: "USD" | "IDR" };
                                    const serviceData = project.service as unknown as ServiceData;
                                    let recurringAmount = 0;
                                    if (serviceData?.interval === 'monthly' || serviceData?.interval === 'yearly') {
                                        recurringAmount += serviceData?.price || 0;
                                    }

                                    const summaryText = project.estimate?.summary || project.description || "";
                                    const lines = summaryText.split('\n');
                                    lines.forEach(line => {
                                        if (line.includes('Monthly') || line.includes('Yearly')) {
                                            const match = line.match(/\(\D*([\d.]+)\s+(Monthly|Yearly)\)/i);
                                            if (match && match[1]) {
                                                recurringAmount += parseFloat(match[1]);
                                            }
                                        }
                                    });

                                    if (recurringAmount === 0 && project.totalAmount > 0) {
                                        recurringAmount = project.totalAmount;
                                    }

                                    return (
                                        <TableRow key={project.id} className="border-zinc-800/50 hover:bg-white/[0.03] transition-colors group">
                                            <TableCell className="py-4 px-6">
                                                <div className="font-bold text-white text-sm tracking-tight">{project.title}</div>
                                                {project.description && project.description.includes('Add-ons:') && (
                                                    <div className="text-[10px] text-brand-yellow/80 mt-1">
                                                        +{project.description.split('Add-ons:')[1].trim().split('\n').length} Add-on(s)
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-zinc-300 text-sm">
                                                {project.clientName || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <Badge variant="outline" className={`text-[10px] h-5 px-2 ${
                                                    project.subscriptionStatus === 'active' && !isExpired 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                        : project.subscriptionStatus === 'pending'
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                    {project.subscriptionStatus === 'active' && !isExpired ? (
                                                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                                                    ) : (
                                                        <><AlertCircle className="w-3 h-3 mr-1" /> {isExpired ? 'Past Due' : project.subscriptionStatus?.toUpperCase()}</>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                                    <span className={`${isExpired ? 'text-red-400 font-bold' : isExpiringSoon ? 'text-amber-400' : 'text-zinc-400'}`}>
                                                        {project.subscriptionEndsAt ? new Date(project.subscriptionEndsAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-right">
                                                <div className="font-mono text-xs text-zinc-400">
                                                    <PriceDisplay amount={project.totalAmount} baseCurrency={(serviceData?.currency as "USD" | "IDR") || 'USD'} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-center">
                                                <RenewSubscriptionButton 
                                                    projectId={project.id} 
                                                    defaultAmount={recurringAmount}
                                                    currency={serviceData?.currency || 'USD'}
                                                    projectTitle={project.title}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
