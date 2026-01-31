import { prisma } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";
import { BillingHistory, type BillingOrder } from "@/components/dashboard/billing/billing-history";
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
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                select: {
                    title: true,
                    invoiceId: true,
                    estimateId: true
                }
            }
        }
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

            <BillingHistory orders={orders as unknown as BillingOrder[]} />
        </div>
    );
}
