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

export const useFloatingChat = create<FloatingChatStore>((set) => {
    // OPTIMASI H6: Definisikan aksi sekali saat inisialisasi agar referensi fungsi tetap stabil secara permanen
    const actions = {
        openChat: (mode: 'ai' | 'human_onboarding' | 'human_chat' = 'ai') => 
            set({ isOpen: true, mode, isMenuOpen: false }),
        closeChat: () => 
            set({ isOpen: false, isMenuOpen: false }),
        toggleChat: () => 
            set((state) => ({ isOpen: !state.isOpen, isMenuOpen: false })),
        setIsMenuOpen: (open: boolean) => 
            set({ isMenuOpen: open, isOpen: false }),
    };

    return {
        isOpen: false,
        isMenuOpen: false,
        mode: 'ai',
        ...actions,
    };
});
