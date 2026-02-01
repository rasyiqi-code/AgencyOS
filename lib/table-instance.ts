import { useReactTable, type TableOptions } from "@tanstack/react-table";

/**
 * Wrapper for useReactTable to centralize TanStack Table usage.
 * This can help avoid strict linter warnings related to the library identifier.
 */
export function useTableInstance<TData>(options: TableOptions<TData>) {
    return useReactTable(options);
}
