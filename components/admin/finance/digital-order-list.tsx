"use client";

import { toast } from "sonner";

import { useState } from "react";
import {
    Search,
    Filter,
    CheckCircle2,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    Calendar,
    DollarSign,
    ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { formatPaymentMethod } from "@/lib/shared/utils";
import { confirmDigitalOrder } from "@/app/actions/digital-orders";

export interface DigitalOrderWithRelations {
    id: string;
    userName: string | null;
    userEmail: string;
    amount: number;
    status: string;
    createdAt: Date;
    product: {
        name: string;
        type: string;
    };
    paymentType: string | null;
    paymentMetadata?: Record<string, unknown> | null;
    licenseId?: string | null;
    proofUrl?: string | null;
}

interface DigitalOrderListProps {
    orders: DigitalOrderWithRelations[];
}

type FilterStatus = 'ALL' | 'PAID' | 'PENDING' | 'WAITING_VERIFICATION';

export function DigitalOrderList({ orders }: DigitalOrderListProps) {
    const t = useTranslations("Admin.Finance.DigitalOrders");
    const ts = useTranslations("Admin.Finance.Status");

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = orders.filter(item => {
        const matchesSearch =
            item.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFilter = true;
        if (statusFilter === 'PAID') matchesFilter = item.status === 'PAID';
        if (statusFilter === 'PENDING') matchesFilter = item.status === 'PENDING';
        if (statusFilter === 'WAITING_VERIFICATION') matchesFilter = item.status === 'WAITING_VERIFICATION';

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
        if (filter === 'ALL') return orders.length;
        return orders.filter(item => item.status === filter).length;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 px-1 border-b border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-brand-yellow/50 focus:ring-brand-yellow/20 rounded-full"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-white/5">
                    <FilterButton
                        label="All"
                        active={statusFilter === 'ALL'}
                        count={getCount('ALL')}
                        onClick={() => handleFilterChange('ALL')}
                    />
                    <FilterButton
                        label="Paid"
                        active={statusFilter === 'PAID'}
                        count={getCount('PAID')}
                        onClick={() => handleFilterChange('PAID')}
                        color="text-emerald-500"
                    />
                    <FilterButton
                        label="Pending"
                        active={statusFilter === 'PENDING'}
                        count={getCount('PENDING')}
                        onClick={() => handleFilterChange('PENDING')}
                        color="text-amber-500"
                    />
                    <FilterButton
                        label="Verification"
                        active={statusFilter === 'WAITING_VERIFICATION'}
                        count={getCount('WAITING_VERIFICATION')}
                        onClick={() => handleFilterChange('WAITING_VERIFICATION')}
                        color="text-blue-500"
                    />
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                    <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                        <Filter className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-400 font-medium">{t("noOrders")}</h3>
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
                        <DigitalOrderListItem key={item.id} order={item} ts={ts} />
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

function DigitalOrderListItem({ order, ts }: { order: DigitalOrderWithRelations, ts: (path: string) => string }) {
    const isPaid = order.status === "PAID";

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    // Customer name logic: Use userName if exists, otherwise email prefix, finally "Guest"
    const displayName = order.userName || order.userEmail.split('@')[0] || "Guest";

    return (
        <AccordionItem value={order.id} className="border border-white/5 rounded-xl bg-zinc-900/50 overflow-hidden px-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/50 hover:no-underline [&[data-state=open]]:bg-zinc-800/30 transition-all group">
                <div className="flex items-center justify-between w-full gap-4 text-left">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-1 h-8 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-white truncate text-sm">
                                    {order.product.name}
                                </h4>
                                <span className="text-zinc-600">/</span>
                                <span className="text-xs text-zinc-400 flex items-center gap-1.5 truncate capitalize">
                                    <User className="w-3 h-3" />
                                    {displayName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span
                                    className="font-mono hover:text-zinc-300 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(order.id, "Order ID");
                                    }}
                                >
                                    #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mr-2">
                        <Badge
                            variant="outline"
                            className={`py-0.5 px-2 text-[10px] h-6 flex items-center gap-1.5 whitespace-nowrap ${isPaid ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}
                        >
                            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isPaid ? ts("paid") : ts("pending")}
                        </Badge>

                        <div className="font-bold text-white text-sm tabular-nums text-right min-w-[80px] flex items-center justify-end">
                            <DollarSign className="w-3 h-3 mr-0.5 text-emerald-400" />
                            {order.amount.toFixed(2)}
                        </div>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 bg-zinc-900/30 border-t border-white/5">
                <div className="flex flex-col gap-4 mt-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Customer Email</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-300">{order.userEmail}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 text-zinc-500 hover:text-white"
                                    onClick={() => copyToClipboard(order.userEmail, "Email")}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Order ID</span>
                            <span className="font-mono text-zinc-300">{order.id}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Product Type</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 capitalize h-5">
                                {order.product.type}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Payment Method</span>
                            <span className="text-zinc-300 font-medium uppercase text-[10px] tracking-wider">
                                {formatPaymentMethod(order.paymentType, order.paymentMetadata)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-4 p-4 rounded-xl bg-zinc-950/30 border border-white/5 border-dashed">
                        <div className="flex-1">
                            {order.licenseId ? (
                                <Button variant="outline" size="sm" className="text-xs gap-2 border-white/5 hover:bg-zinc-800" asChild>
                                    <a href={`/admin/licenses?id=${order.licenseId}`}>
                                        <ExternalLink className="w-3 h-3" />
                                        View Associated License
                                    </a>
                                </Button>
                            ) : (
                                <span className="text-xs text-zinc-500 italic block">No license associated</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {order.proofUrl && (
                                <Button variant="secondary" size="sm" className="text-xs gap-2 bg-zinc-800 hover:bg-zinc-700 border-white/10" asChild>
                                    <a href={order.proofUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3 text-blue-400" />
                                        View Proof
                                    </a>
                                </Button>
                            )}

                            {!isPaid && (
                                <ConfirmPaymentButton orderId={order.id} />
                            )}
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

function ConfirmPaymentButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to confirm this payment?")) return;

        setLoading(true);
        try {
            const res = await confirmDigitalOrder(orderId);
            if (res.success) {
                toast.success("Payment confirmed successfully!");
                window.location.reload();
            } else {
                toast.error(res.error || "Failed to confirm payment");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="text-xs gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 border-none ring-1 ring-white/10"
        >
            {loading ? <Clock className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Confirm Payment
        </Button>
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
    );
}
