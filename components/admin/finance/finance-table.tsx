"use client";

import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    type HeaderGroup,
    type Header,
    type Row,
    type Cell,
} from "@tanstack/react-table";

import { ShoppingCart } from "lucide-react";
import { financeColumns, FinanceData } from "./finance-columns";
import { useTableInstance } from "@/lib/shared/table-instance";

interface FinanceTableProps {
    data: FinanceData[];
}

export function FinanceTable({ data }: FinanceTableProps) {
    const table = useTableInstance({
        data,
        columns: financeColumns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange",
    });

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm relative overflow-hidden group/container">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="overflow-x-auto w-full 
                    [&::-webkit-scrollbar]:h-1.5 
                    [&::-webkit-scrollbar-track]:bg-transparent 
                    [&::-webkit-scrollbar-thumb]:bg-white/10 
                    [&::-webkit-scrollbar-thumb]:rounded-full 
                    hover:[&::-webkit-scrollbar-thumb]:bg-white/20
                    transition-colors"
                >
                    <table className="border-separate border-spacing-0 table-fixed w-full text-sm relative">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup: HeaderGroup<FinanceData>) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header: Header<FinanceData, unknown>) => {
                                        const isActions = header.column.id === 'actions';

                                        return (
                                            <th
                                                key={header.id}
                                                className={`
                                                    h-12 px-4 text-left align-middle font-bold text-zinc-500 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 relative group transition-colors hover:bg-zinc-900/80 sticky top-0 z-40
                                                    ${isActions ? "sticky right-0 text-right z-50 border-l border-white/5 shadow-[-8px_0_20px_-10px_rgba(0,0,0,0.5)] bg-zinc-950" : "border-r border-white-[0.02]"}
                                                `}
                                                style={{ width: header.getSize() }}
                                            >
                                                <div className={`uppercase text-[10px] tracking-widest whitespace-nowrap overflow-hidden ${isActions ? "pr-2" : ""}`}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </div>

                                                {/* Resizer Handle */}
                                                {!isActions && header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-emerald-500/50 active:bg-emerald-500 transition-colors z-[60]
                                                            ${header.column.getIsResizing() ? "bg-emerald-500 w-[2px]" : ""}`}
                                                    />
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-transparent">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row: Row<FinanceData>) => (
                                    <tr
                                        key={row.id}
                                        className="group transition-all hover:bg-white/[0.02] active:bg-white/[0.04]"
                                    >
                                        {row.getVisibleCells().map((cell: Cell<FinanceData, unknown>) => {
                                            const isActions = cell.column.id === 'actions';
                                            const isId = cell.column.id === 'id';

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={`
                                                        h-16 px-4 align-middle border-b border-white/5 relative overflow-hidden transition-colors z-10 bg-transparent
                                                        ${isActions ? "sticky right-0 z-30 bg-zinc-950/95 backdrop-blur-md group-hover:bg-[#111113] border-l border-white/5 shadow-[-8px_0_20px_-10px_rgba(0,0,0,0.5)]" : "border-r border-white-[0.01]"}
                                                        ${isId ? "font-mono" : ""}
                                                    `}
                                                    style={{ width: cell.column.getSize() }}
                                                >
                                                    {/* Row Highlight Effect */}
                                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className={`leading-snug truncate ${isActions ? "flex justify-end items-center h-full" : ""}`}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={table.getAllColumns().length}
                                        className="h-40 text-center align-middle text-zinc-600 border-b border-white/5"
                                    >
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <ShoppingCart className="w-8 h-8 mb-2" />
                                            <p className="font-medium">No financial records found</p>
                                            <p className="text-xs">Incoming orders and invoices will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
