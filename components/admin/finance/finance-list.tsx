"use client";

import { useState } from "react";
import { FinanceData } from "@/components/admin/finance/finance-columns";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Copy,
    ChevronLeft,
    ChevronRight,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { toast } from "sonner";
import { ConfirmPaymentButton } from "@/components/admin/orders/confirm-payment";
import { UnpaidButton } from "@/components/admin/orders/unpaid-button";
import { ViewProofButton } from "@/components/admin/orders/view-proof-button";
import { CancelOrderButton } from "@/components/admin/orders/cancel-button";
import { useTranslations } from "next-intl";
import { formatPaymentMethod } from "@/lib/shared/utils";

interface FinanceListProps {
    data: FinanceData[];
}

type FilterStatus = 'ALL' | 'PAID' | 'PENDING' | 'PARTIAL';

export function FinanceList({ data }: FinanceListProps) {
    const t = useTranslations("Admin.Finance");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = data.filter(item => {
        // Search Logic
        const matchesSearch =
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.project?.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter Logic
        let matchesFilter = true;
        const isPaid = item.status === 'paid' || item.status === 'settled';
        const isPending = item.status === 'pending_payment' || item.status === 'pending' || item.status === 'payment_pending';
        const isPartial = item.project?.paymentStatus === 'PARTIAL';
        const isRepayment = item.paymentType === 'REPAYMENT';

        if (statusFilter === 'PAID') matchesFilter = isPaid;
        if (statusFilter === 'PENDING') {
            matchesFilter = (isPending && !isPartial) || (isPending && isPartial && isRepayment);
        }
        if (statusFilter === 'PARTIAL') {
            matchesFilter = isPartial && (!isPending || !isRepayment);
        }

        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (newFilter: FilterStatus) => {
        setStatusFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const getCount = (filter: FilterStatus) => {
        return data.filter(item => {
            const isPaid = item.status === 'paid' || item.status === 'settled';
            const isPending = item.status === 'pending_payment' || item.status === 'pending' || item.status === 'payment_pending';
            const isPartial = item.project?.paymentStatus === 'PARTIAL';
            const isRepayment = item.paymentType === 'REPAYMENT';

            if (filter === 'ALL') return true;
            if (filter === 'PAID') return isPaid;
            if (filter === 'PENDING') return (isPending && !isPartial) || (isPending && isPartial && isRepayment);
            if (filter === 'PARTIAL') return isPartial && (!isPending || !isRepayment);
            return false;
        }).length;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 px-1 border-b border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search invoices, clients, or projects..."
                        className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-brand-yellow/50 focus:ring-brand-yellow/20 rounded-full"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                    <FilterButton
                        label="All"
                        active={statusFilter === 'ALL'}
                        count={getCount('ALL')}
                        onClick={() => handleFilterChange('ALL')}
                    />
                    <FilterButton
                        label="Pending"
                        active={statusFilter === 'PENDING'}
                        count={getCount('PENDING')}
                        onClick={() => handleFilterChange('PENDING')}
                        color="text-amber-500"
                    />
                    <FilterButton
                        label="Partial (DP)"
                        active={statusFilter === 'PARTIAL'}
                        count={getCount('PARTIAL')}
                        onClick={() => handleFilterChange('PARTIAL')}
                        color="text-indigo-400"
                    />
                    <FilterButton
                        label="Paid"
                        active={statusFilter === 'PAID'}
                        count={getCount('PAID')}
                        onClick={() => handleFilterChange('PAID')}
                        color="text-emerald-500"
                    />
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                    <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                        <Filter className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-400 font-medium">{t("noOrders")}</h3>
                    <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or search query</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchQuery(""); handleFilterChange('ALL'); }}
                        className="text-brand-yellow mt-2"
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <Accordion type="single" collapsible className="space-y-2 mt-4">
                    {paginatedData.map((item) => (
                        <FinanceListItem key={item.id} data={item} />
                    ))}
                </Accordion>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="text-xs text-zinc-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-zinc-400 tabular-nums">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function FinanceListItem({ data }: { data: FinanceData }) {
    const t = useTranslations("Admin.Finance.Status");
    const isPaid = data.status === 'paid' || data.status === 'settled';
    const isPending = data.status === 'pending_payment' || data.status === 'pending' || data.status === 'payment_pending';
    const isPartial = data.project?.paymentStatus === 'PARTIAL';
    const isSettledDP = (data.project?.paymentStatus === 'PARTIAL' || data.project?.paymentStatus === 'PAID') && data.paymentType === 'DP';

    let statusClass = "text-zinc-400 border-zinc-700 bg-zinc-800/50";
    let statusIcon = <Clock className="w-3 h-3" />;

    if (isPaid) {
        statusClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        statusIcon = <CheckCircle2 className="w-3 h-3" />;
    } else if (isPartial) {
        statusClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        statusIcon = <AlertCircle className="w-3 h-3" />;
    } else if (isPending) {
        statusClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
        statusIcon = <Clock className="w-3 h-3" />;
    } else if (data.status === 'cancelled') {
        statusClass = "bg-red-500/10 text-red-500 border-red-500/20";
        statusIcon = <XCircle className="w-3 h-3" />;
    }

    const copyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(data.id);
        toast.success("Order ID copied");
    };

    return (
        <AccordionItem value={data.id} className="border border-white/5 rounded-xl bg-zinc-900/50 overflow-hidden px-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/50 hover:no-underline [&[data-state=open]]:bg-zinc-800/30 transition-all group">
                <div className="flex items-center justify-between w-full gap-4 text-left">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-1 h-8 rounded-full ${isPaid ? 'bg-emerald-500' : isPartial ? 'bg-indigo-500' : data.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'} shrink-0`} />

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-white truncate text-sm">
                                    {data.project?.title || data.title || "Untitled Project"}
                                </h4>
                                <span className="text-zinc-600">/</span>
                                <span className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                                    <User className="w-3 h-3" />
                                    {data.project?.clientName || "Direct Order"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span
                                    className="font-mono hover:text-zinc-300 cursor-pointer flex items-center gap-1 transition-colors hover:underline"
                                    onClick={copyId}
                                    title="Copy ID"
                                >
                                    #{data.id.slice(-8).toUpperCase()}
                                </span>
                                <span>•</span>
                                <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mr-2">
                        <div className="flex items-center gap-1.5">
                            {data.paymentType && (
                                <Badge variant="secondary" className={`text-[9px] h-5 px-1.5 border ${(data.paymentType === 'REPAYMENT' && isPaid) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    data.paymentType === 'DP' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                        data.paymentType === 'REPAYMENT' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    }`}>
                                    {(data.paymentType === 'REPAYMENT' && isPaid) ? t('full') :
                                        data.paymentType === 'DP' ? t('dp') :
                                            data.paymentType === 'REPAYMENT' ? t('repayment') :
                                                t('full')}
                                </Badge>
                            )}
                            <Badge variant="outline" className={`py-0.5 px-2 text-[10px] h-6 flex items-center gap-1.5 whitespace-nowrap ${statusClass}`}>
                                {statusIcon}
                                {isPending && data.paymentType === 'REPAYMENT' ? t('pending') : isPartial ? t('partial') : data.status.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="font-bold text-white text-sm tabular-nums text-right min-w-[80px]">
                                <PriceDisplay
                                    amount={
                                        data.paymentType === 'DP'
                                            ? (data.transactionAmount || (data.project?.totalAmount || 0) * 0.5)
                                            : data.paymentType === 'REPAYMENT' && !isPaid
                                                ? Math.max(0, (data.project?.totalAmount || 0) - (data.project?.paidAmount || 0))
                                                : (data.transactionAmount || data.project?.totalAmount || data.totalCost)
                                    }
                                    baseCurrency={(data.paymentType === 'REPAYMENT' && !isPaid) ? 'USD' : (data.isLegacyMismatched ? 'USD' : data.currency) as 'USD' | 'IDR'}
                                    exchangeRate={data.exchangeRate || undefined}
                                />
                            </div>
                            {data.paymentType === 'REPAYMENT' && !isPaid && (
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium">
                                    {t("remaining")}
                                </span>
                            )}
                            {data.paymentType === 'DP' && (
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium">
                                    {t("downPayment")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-2 bg-zinc-900/30 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Full Invoice ID</span>
                            <span className="font-mono text-zinc-300 flex items-center gap-2">
                                {data.id}
                                <Copy className="w-3 h-3 cursor-pointer hover:text-white" onClick={copyId} />
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Payment Type</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] px-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 h-5">
                                    {data.paymentType || (isPartial ? 'DP' : 'FULL')}
                                </Badge>
                                {isPartial && !isSettledDP && (
                                    <span className="text-[10px] text-indigo-400">
                                        {data.paymentType === 'REPAYMENT' ? t("waitingConfirmation") : t("waitingRepayment")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Payment Method</span>
                            <span className="text-zinc-300 font-medium uppercase text-[10px] tracking-wider">
                                {formatPaymentMethod(data.paymentMethod, data.paymentMetadata)}
                            </span>
                        </div>

                        {(data.proofUrl || data.project?.order?.proofUrl) && (
                            <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                                <span className="text-zinc-500">Proof of Payment</span>
                                <ViewProofButton estimate={{
                                    ...data,
                                    proofUrl: (data.proofUrl || data.project?.order?.proofUrl) as string,
                                    paymentType: data.paymentType
                                }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end justify-center gap-3 p-4 rounded-lg bg-zinc-950/30 border border-white/5 border-dashed">
                        <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest mb-1 w-full text-right block border-b border-zinc-800 pb-2">
                            Quick Actions
                        </span>

                        <div className="flex items-center gap-2 mt-2">
                            {isPending && !isSettledDP && (
                                <div className="flex items-center">
                                    <span className="text-xs text-amber-500 italic mr-2">{t("waitingConfirmation")}</span>
                                    <ConfirmPaymentButton estimateId={data.id} paymentType={data.paymentType} />
                                </div>
                            )}
                            {isPaid && (
                                <div className="flex items-center">
                                    <span className="text-xs text-emerald-500 italic mr-2">{t("paymentVerified")}</span>
                                    <UnpaidButton estimateId={data.id} />
                                </div>
                            )}
                            {isSettledDP && (
                                <span className="text-xs text-zinc-500 italic">{t("dpSettled")} - No Action Needed</span>
                            )}
                            {data.status !== 'cancelled' && <CancelOrderButton estimateId={data.id} />}
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

function FilterButton({ label, active, onClick, count, color }: { label: string, active: boolean, onClick: () => void, count: number, color?: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2
                ${active ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
            `}
        >
            <span className={active && color ? color : ''}>{label}</span>
            <span className={`px-1.5 py-0.5 rounded-full bg-zinc-950 text-[10px] min-w-[20px] text-center ${active ? 'text-white' : 'text-zinc-600'}`}>
                {count}
            </span>
        </button>
    )
}
