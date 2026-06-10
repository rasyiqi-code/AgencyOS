"use client";

import { create } from "zustand";
import { ReactNode } from "react";

interface HeaderStoreState {
    actions: ReactNode | null;
    setActions: (actions: ReactNode | null) => void;
}

export const useHeaderStore = create<HeaderStoreState>((set) => ({
    actions: null,
    setActions: (actions) => set({ actions }),
}));
