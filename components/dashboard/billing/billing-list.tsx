"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Calendar, FileText, CreditCard, Copy, LayoutGrid, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PriceDisplay } from "@/components/providers/currency-provider";
import Link from "next/link";
import { toast } from "sonner";
import "@/types/payment"; // Import for Window.snap type augmentation

export interface BillingOrder {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    snapToken: string | null;
    type: string;
    project: {
        title: string;
        invoiceId: string | null;
        estimateId: string | null;
        paymentStatus?: string | null;
    } | null;
}

interface BillingListProps {
    orders: BillingOrder[];
}

type FilterStatus = 'ALL' | 'PAID' | 'PENDING' | 'WAITING_VERIFICATION';

export function BillingList({ orders }: BillingListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = orders.filter(item => {
        // Search Logic
        const matchesSearch =
            item.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter Logic
        let matchesFilter = true;

        if (statusFilter === 'PAID') matchesFilter = item.status === 'paid' || item.status === 'settled';
        if (statusFilter === 'PENDING') matchesFilter = item.status === 'pending';
        if (statusFilter === 'WAITING_VERIFICATION') matchesFilter = item.status === 'waiting_verification';

        return matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (newFilter: FilterStatus) => {
        setStatusFilter(newFilter);
        setCurrentPage(1); // Reset to first page
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const getCount = (filter: FilterStatus) => {
        return orders.filter(item => {
            if (filter === 'ALL') return true;
            if (filter === 'PAID') return item.status === 'paid' || item.status === 'settled';
            if (filter === 'PENDING') return item.status === 'pending';
            if (filter === 'WAITING_VERIFICATION') return item.status === 'waiting_verification';
            return false;
        }).length;
    }

    return (
        <div className="space-y-6">
            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 px-1 border-b border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search invoices or projects..."
                        className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-brand-yellow/50 focus:ring-brand-yellow/20 rounded-full"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                    <FilterButton
                        label="All"
                        icon={<LayoutGrid className="w-3.5 h-3.5" />}
                        active={statusFilter === 'ALL'}
                        count={getCount('ALL')}
                        onClick={() => handleFilterChange('ALL')}
                    />
                    <FilterButton
                        label="Pending"
                        icon={<Clock className="w-3.5 h-3.5" />}
                        active={statusFilter === 'PENDING'}
                        count={getCount('PENDING')}
                        onClick={() => handleFilterChange('PENDING')}
                        color="text-brand-yellow"
                    />
                    <FilterButton
                        label="Waiting Verification"
                        icon={<Hourglass className="w-3.5 h-3.5" />}
                        active={statusFilter === 'WAITING_VERIFICATION'}
                        count={getCount('WAITING_VERIFICATION')}
                        onClick={() => handleFilterChange('WAITING_VERIFICATION')}
                        color="text-blue-500"
                    />
                    <FilterButton
                        label="Paid"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        active={statusFilter === 'PAID'}
                        count={getCount('PAID')}
                        onClick={() => handleFilterChange('PAID')}
                        color="text-emerald-500"
                    />
                </div>
            </div>

            {/* List Content */}
            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                    <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                        <Filter className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-400 font-medium">No billing history found</h3>
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
                        <BillingListItem key={item.id} order={item} />
                    ))}
                </Accordion>
            )}

            {/* Pagination Controls */}
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

function BillingListItem({ order }: { order: BillingOrder }) {
    const isPaid = order.status === 'paid' || order.status === 'settled';
    const isPending = order.status === 'pending';
    const isWaiting = order.status === 'waiting_verification';
    const isPartial = order.project?.paymentStatus === 'PARTIAL' && order.type === 'DP';

    // Status Logic
    let statusClass = "text-zinc-400 border-zinc-700 bg-zinc-800/50";
    let statusIcon = <Clock className="w-3 h-3" />;

    if (isPartial) {
        statusClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        statusIcon = <AlertCircle className="w-3 h-3" />;
    } else if (isPaid) {
        statusClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        statusIcon = <CheckCircle2 className="w-3 h-3" />;
    } else if (isPending) {
        statusClass = "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
        statusIcon = <Clock className="w-3 h-3" />;
    } else if (isWaiting) {
        statusClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
        statusIcon = <Clock className="w-3 h-3" />;
    }

    // Determine Payment Type Badge Color
    const copyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(order.id);
        toast.success("Invoice ID copied");
    };

    return (
        <AccordionItem value={order.id} className="border border-white/5 rounded-xl bg-zinc-900/50 overflow-hidden px-0">
            <AccordionTrigger className="px-4 py-4 hover:bg-zinc-800/50 hover:no-underline [&[data-state=open]]:bg-zinc-800/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 text-left">
                    {/* Left: Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-1 h-10 rounded-full ${isPaid ? 'bg-emerald-500' : isPending ? 'bg-brand-yellow' : isWaiting ? 'bg-blue-500' : 'bg-zinc-500'} shrink-0`} />

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                <h4 className="font-bold text-white truncate text-sm">
                                    {order.project?.title || "Project Deposit"}
                                </h4>
                                {(order.type === 'DP' || order.type === 'REPAYMENT') && (
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                                        {order.type}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span
                                    className="font-mono hover:text-zinc-300 cursor-pointer flex items-center gap-1 transition-colors hover:underline"
                                    onClick={copyId}
                                    title="Copy ID"
                                >
                                    #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <span className="hidden xs:inline">•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Status & Amount */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:mr-2 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
                        <Badge variant="outline" className={`py-0.5 px-2 text-[10px] h-6 flex items-center gap-1.5 whitespace-nowrap ${statusClass}`}>
                            {statusIcon}
                            {isPartial ? 'PARTIAL (DP)' : order.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>

                        <div className="font-black text-white text-base tabular-nums text-right min-w-[80px] tracking-tighter">
                            <PriceDisplay amount={order.amount} />
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-2 bg-zinc-900/30 border-t border-white/5">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end mt-2">
                    <div className="space-y-1 text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                            <span>Full Invoice ID:</span>
                            <span className="font-mono text-zinc-300">{order.id}</span>
                            <Copy className="w-3 h-3 cursor-pointer hover:text-white" onClick={copyId} />
                        </div>
                        {order.project?.invoiceId && (
                            <div className="flex items-center gap-2">
                                <span>Reference ID:</span>
                                <span className="font-mono text-zinc-300">{order.project.invoiceId}</span>
                            </div>
                        )}
                        {order.project?.paymentStatus && (
                            <div className="flex items-center gap-2 mt-1">
                                <span>Project Status:</span>
                                <Badge variant="outline" className="text-[9px] px-1.5 h-4 border-zinc-700 text-zinc-400">
                                    {order.project.paymentStatus.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {(order.status === 'pending' && order.project?.estimateId) ? (
                            <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs bg-brand-yellow hover:bg-brand-yellow/80 text-black border-0 font-bold"
                                asChild
                            >
                                <Link href={`/checkout/${order.project.estimateId}?paymentType=${order.type}`}>
                                    <CreditCard className="w-3 h-3 mr-1.5" />
                                    {order.type === 'DP' ? 'Pay DP' : order.type === 'REPAYMENT' ? 'Pay Remaining' : 'Pay Now'}
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/10 border-white/10 bg-zinc-950"
                                asChild
                            >
                                <Link href={`/invoices/${order.id}${order.snapToken ? `?token=${order.snapToken}` : ''}`} target="_blank">
                                    <FileText className="w-3 h-3 mr-1.5" />
                                    View Invoice
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}


function FilterButton({ label, icon, active, onClick, count, color }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void, count: number, color?: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2
                ${active ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
            `}
            title={label}
        >
            <span className={`block sm:hidden ${active && color ? color : ''}`}>{icon}</span>
            <span className={`hidden sm:block ${active && color ? color : ''}`}>{label}</span>
            <span className={`px-1.5 py-0.5 rounded-full bg-zinc-950 text-[10px] min-w-[20px] text-center ${active ? 'text-white' : 'text-zinc-600'}`}>
                {count}
            </span>
        </button>
    )
}
