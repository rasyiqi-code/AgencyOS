"use client";
"use no memo";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    ColumnFiltersState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClientsDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function ClientsDataTable<TData, TValue>({
    columns,
    data,
}: ClientsDataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        state: {
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    });

    return (
        <div className="grid w-full grid-cols-1 overflow-hidden space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search clients..."
                        value={(table.getColumn("profile")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("profile")?.setFilterValue(event.target.value)
                        }
                        className="pl-9 h-9 bg-[#09090b] border-zinc-800 focus-visible:ring-zinc-700 placeholder:text-zinc-600"
                    />
                </div>
            </div>

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
                        className="border-separate border-spacing-0 table-fixed w-full min-w-[1000px] text-sm"
                    >
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const headerClasses = "h-10 px-2 text-left align-middle font-bold text-zinc-400 bg-zinc-950 border-b border-zinc-800 relative group transition-colors hover:bg-zinc-900 sticky top-0 z-40 border-r border-zinc-800/50";

                                        return (
                                            <th
                                                key={header.id}
                                                className={headerClasses}
                                                style={{
                                                    width: header.getSize(),
                                                }}
                                            >
                                                <div className="px-1 uppercase text-[10px] tracking-wider whitespace-nowrap overflow-hidden">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-transparent">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="group transition-colors hover:bg-zinc-900/30"
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const cellClasses = "h-14 px-2 align-middle border-b border-zinc-800/50 relative overflow-hidden transition-colors z-10 bg-transparent border-r border-zinc-800/50";

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={cellClasses}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                    }}
                                                >
                                                    <div className="leading-snug px-1 truncate">
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
                                        No clients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4 pr-4 border-t border-zinc-800/50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 border-zinc-800 text-zinc-400 hover:text-white bg-transparent"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 border-zinc-800 text-zinc-400 hover:text-white bg-transparent"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
