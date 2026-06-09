"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

/**
 * Provider untuk membungkus aplikasi Next.js dengan TanStack Query (React Query).
 * QueryClient diinisialisasi menggunakan state agar dibuat sekali saja per sesi client,
 * guna menghindari kebocoran data (data leak) antar user di sisi server (SSR).
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    // Inisialisasi QueryClient sekali per instansi client
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Mengatur staleTime default menjadi 1 menit
                        // untuk menghindari refetching berlebihan saat komponen di-mount ulang
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false, // Menonaktifkan refetch otomatis saat berpindah tab browser
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
