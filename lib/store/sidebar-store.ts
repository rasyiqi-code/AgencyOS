"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
    isCollapsed: boolean;
    toggle: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

// Fungsi debounce setItem untuk menghindari penulisan synchronous beruntun ke localStorage
const debouncedSetItem = (() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const pendingWrites = new Map<string, string>();

    return (key: string, value: string) => {
        pendingWrites.set(key, value);
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (typeof window !== "undefined") {
                for (const [k, v] of pendingWrites.entries()) {
                    localStorage.setItem(k, v);
                }
                pendingWrites.clear();
            }
            timeoutId = null;
        }, 250); // Lakukan debounce selama 250ms
    };
})();

// Custom storage wrapper yang aman dari SSR dan menggunakan debounce untuk setItem
const debouncedStorage = {
    getItem: (name: string) => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(name);
    },
    setItem: (name: string, value: string) => {
        debouncedSetItem(name, value);
    },
    removeItem: (name: string) => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(name);
    }
};

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            isCollapsed: false,
            toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
            setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
        }),
        {
            name: "sidebar-storage",
            storage: createJSONStorage(() => debouncedStorage),
        }
    )
);
