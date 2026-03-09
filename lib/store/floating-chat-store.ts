import { create } from 'zustand';

interface FloatingChatStore {
    isOpen: boolean;
    isMenuOpen: boolean;
    mode: 'ai' | 'human_onboarding' | 'human_chat';
    openChat: (mode?: 'ai' | 'human_onboarding' | 'human_chat') => void;
    closeChat: () => void;
    toggleChat: () => void;
    setIsMenuOpen: (open: boolean) => void;
}

export const useFloatingChat = create<FloatingChatStore>((set) => ({
    isOpen: false,
    isMenuOpen: false,
    mode: 'ai',
    openChat: (mode = 'ai') => set({ isOpen: true, mode, isMenuOpen: false }),
    closeChat: () => set({ isOpen: false, isMenuOpen: false }),
    toggleChat: () => set((state) => ({ isOpen: !state.isOpen, isMenuOpen: false })),
    setIsMenuOpen: (open) => set({ isMenuOpen: open, isOpen: false }),
}));
