"use client";

import * as React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    type HeaderGroup,
    type Header,
    type Row,
    type Cell,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTableInstance } from "@/lib/shared/table-instance";

interface OrdersDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function OrdersDataTable<TData, TValue>({
    columns,
    data,
}: OrdersDataTableProps<TData, TValue>) {
    const t = useTranslations("Admin.Finance");
    const table = useTableInstance({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        columnResizeMode: "onChange",
        defaultColumn: {
            minSize: 0,
            maxSize: 1000,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    });

    return (
        <div className="grid w-full grid-cols-1 overflow-hidden">
            <div className="rounded-xl border border-zinc-800/50 bg-[#09090b] relative overflow-hidden">
                <div className="overflow-x-auto w-full 
                    [&::-webkit-scrollbar]:h-1.5 
                    [&::-webkit-scrollbar-track]:bg-transparent 
                    [&::-webkit-scrollbar-thumb]:bg-zinc-800/50 
                    [&::-webkit-scrollbar-thumb]:rounded-full 
                    hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700/80
                    transition-colors"
                >
                    <table
                        className="border-separate border-spacing-0 table-fixed w-full min-w-[1400px] text-sm"
                    >
                        <thead>
                            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header: Header<TData, unknown>) => {
                                        const isActions = header.column.id === 'actions';

                                        let headerClasses = "h-10 px-2 text-left align-middle font-bold text-zinc-400 bg-zinc-950 border-b border-zinc-800 relative group transition-colors hover:bg-zinc-900 sticky top-0 z-40";

                                        if (isActions) {
                                            headerClasses = "h-10 text-center align-middle font-bold text-zinc-400 bg-zinc-950 border-b border-zinc-800 relative group transition-colors hover:bg-zinc-900 sticky top-0 right-0 z-50 border-l border-zinc-800 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.5)]";
                                        } else {
                                            headerClasses += " border-r border-zinc-800/50";
                                        }

                                        return (
                                            <th
                                                key={header.id}
                                                className={headerClasses}
                                                style={{
                                                    width: header.getSize(),
                                                }}
                                            >
                                                <div className={`uppercase text-[10px] tracking-wider whitespace-nowrap overflow-hidden ${isActions ? "flex justify-center px-1" : "px-1"}`}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </div>

                                                {/* Resizer Handle */}
                                                {!isActions && header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-[#cd1717] active:bg-[#a50f0f] transition-colors z-[60]
                                                            ${header.column.getIsResizing() ? "bg-[#cd1717] w-[2px]" : ""}`}
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
                                table.getRowModel().rows.map((row: Row<TData>) => (
                                    <tr
                                        key={row.id}
                                        className="group transition-colors hover:bg-zinc-900/30"
                                    >
                                        {row.getVisibleCells().map((cell: Cell<TData, unknown>) => {
                                            const isActions = cell.column.id === 'actions';

                                            let cellClasses = "h-12 px-2 align-middle border-b border-zinc-800/50 relative overflow-hidden transition-colors z-10 bg-transparent";

                                            if (isActions) {
                                                cellClasses = "h-12 px-2 align-middle border-b border-zinc-800 border-zinc-800/50 relative overflow-hidden transition-colors sticky right-0 z-30 bg-zinc-950 group-hover:bg-[#111113] border-l border-zinc-800 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.5)]";
                                            } else {
                                                cellClasses += " border-r border-zinc-800/50";
                                            }

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={cellClasses}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                    }}
                                                >
                                                    <div className={`leading-snug px-1 truncate ${isActions ? "flex justify-center" : ""}`}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-32 text-center align-middle text-zinc-600 border-b border-zinc-800/50"
                                    >
                                        {t("noOrders")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Simple Pagination Controls if needed */}
                {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4 pr-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 border-zinc-800 text-zinc-400 hover:text-white bg-transparent"
                        >
                            {t("previous")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 border-zinc-800 text-zinc-400 hover:text-white bg-transparent"
                        >
                            {t("next")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
