import { ReactNode } from "react";

/**
 * Layout pembungkus untuk halaman Marketing Center.
 * Bersih tanpa tab navigasi horizontal lokal karena navigasi dikelola langsung oleh sidebar admin.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
