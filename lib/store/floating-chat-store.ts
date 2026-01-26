import { create } from 'zustand';

interface FloatingChatStore {
    isOpen: boolean;
    mode: 'ai' | 'human_onboarding' | 'human_chat';
    openChat: (mode?: 'ai' | 'human_onboarding' | 'human_chat') => void;
    closeChat: () => void;
    toggleChat: () => void;
}

export const useFloatingChat = create<FloatingChatStore>((set) => ({
    isOpen: false,
    mode: 'ai',
    openChat: (mode = 'ai') => set({ isOpen: true, mode }),
    closeChat: () => set({ isOpen: false }),
    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
}));
