
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-black">
            <div className="no-print contents">
                <SiteHeader />
            </div>
            <main className="flex-1 pt-14">
                {children}
            </main>
            <div className="no-print">
                <SiteFooter />
            </div>
        </div>
    );
}
