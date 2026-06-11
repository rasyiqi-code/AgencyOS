import { create } from "zustand";
import { ReactNode } from "react";

interface AdminHeaderState {
    title: ReactNode | null;
    actions: ReactNode | null;
    setTitle: (title: ReactNode | null) => void;
    setActions: (actions: ReactNode | null) => void;
    clearHeader: () => void;
}

export const useAdminHeaderStore = create<AdminHeaderState>((set) => ({
    title: null,
    actions: null,
    setTitle: (title) => set({ title }),
    setActions: (actions) => set({ actions }),
    clearHeader: () => set({ title: null, actions: null }),
}));
