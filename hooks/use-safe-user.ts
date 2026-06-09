import { useUser } from "@hexclave/tanstack-start";
import { useMemo } from "react";

/**
 * A custom hook that wraps Stack Auth's `useUser()` hook to centralize user data normalization.
 * Specifically, it handles a bug where Stack Auth passing an empty string for `profileImageUrl`
 * causes browser errors, by overriding it (and other potentially empty string fields) with `undefined`.
 */
export function useSafeUser() {
    const user = useUser();

    // OPTIMASI H7: Membungkus mockUserFallback dengan useMemo agar tidak membuat referensi objek baru pada tiap siklus rendering
    const mockUserFallback = useMemo(() => {
        if (user?.profileImageUrl === "") {
            return {
                ...user,
                displayName: user.displayName || undefined,
                primaryEmail: user.primaryEmail || undefined,
                profileImageUrl: undefined
            } as unknown as { displayName?: string; primaryEmail?: string; profileImageUrl?: string };
        }
        return undefined;
    }, [user]);

    return {
        user,
        mockUserFallback
    };
}
