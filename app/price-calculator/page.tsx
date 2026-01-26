import { SiteHeader } from "@/components/landing/site-header";
import { QuoteForm } from "@/components/quote/quote-form";

export default function QuotePage() {
    return (
        <main className="min-h-screen bg-black selection:bg-lime-500/30">
            <SiteHeader />
            <QuoteForm />
        </main>
    );
}
