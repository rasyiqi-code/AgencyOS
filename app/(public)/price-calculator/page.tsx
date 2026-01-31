import { QuoteForm } from "@/components/quote/quote-form";
import { isAdmin } from "@/lib/auth-helpers";

export default async function QuotePage() {
    const isUserAdmin = await isAdmin();

    return (
        <div className="min-h-screen bg-black selection:bg-lime-500/30">
            <QuoteForm isAdmin={isUserAdmin} />
        </div>
    );
}
