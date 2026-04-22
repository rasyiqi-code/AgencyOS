import { prisma } from "@/lib/config/db";
import { stackServerApp } from "@/lib/config/stack";
import { BillingList, type BillingOrder } from "@/components/dashboard/billing/billing-list";
import { UnpaidBills } from "@/components/dashboard/billing/unpaid-bills";
import { Receipt } from "lucide-react";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

export default async function ClientBillingPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    const orders = await prisma.order.findMany({
        where: {
            userId: user.id,
            project: {
                status: { notIn: ['draft', 'pending', 'pending_offer'] }
            }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                select: {
                    title: true,
                    description: true,
                    invoiceId: true,
                    estimateId: true,
                    paymentStatus: true
                }
            }
        }
    });

    // Ambil tagihan langganan bulanan yang belum dibayar
    const unpaidEstimates = await prisma.estimate.findMany({
        where: {
            project: { userId: user.id },
            complexity: "Subscription Renewal",
            status: "pending_payment"
        },
        include: { service: true },
        orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const projectsNeedingRenewal = await prisma.project.findMany({
        where: {
            userId: user.id,
            subscriptionStatus: { not: null },
            subscriptionEndsAt: { lte: nextWeek },
            estimate: {
                status: { not: "pending_payment" }
            }
        },
        include: { service: true }
    });

    return (
        <div className="w-full py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Receipt className="w-8 h-8 text-brand-yellow" />
                    {isId ? 'Tagihan & Faktur' : 'Billing & Invoices'}
                </h1>
                <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
                    {isId ? 'Lacak riwayat pembayaran dan unduh faktur Anda.' : 'Track your payment history and download invoices.'}
                </p>
            </div>

            <UnpaidBills unpaidEstimates={unpaidEstimates} projectsNeedingRenewal={projectsNeedingRenewal} />

            <BillingList orders={orders as unknown as BillingOrder[]} />
        </div>
    );
}
