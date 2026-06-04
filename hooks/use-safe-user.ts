import { useUser } from "@hexclave/next";

/**
 * A custom hook that wraps Stack Auth's `useUser()` hook to centralize user data normalization.
 * Specifically, it handles a bug where Stack Auth passing an empty string for `profileImageUrl`
 * causes browser errors, by overriding it (and other potentially empty string fields) with `undefined`.
 */
export function useSafeUser() {
    const user = useUser();

    const mockUserFallback = user?.profileImageUrl === "" ? {
        ...user,
        displayName: user.displayName || undefined,
        primaryEmail: user.primaryEmail || undefined,
        profileImageUrl: undefined
    } as unknown as { displayName?: string; primaryEmail?: string; profileImageUrl?: string } : undefined;

    return {
        user,
        mockUserFallback
    };
}
