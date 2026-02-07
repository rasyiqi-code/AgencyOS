import { CreateTicketForm } from "@/components/support/create-ticket-form";
import { stackServerApp } from "@/lib/config/stack";
import { redirect } from "next/navigation";

export default async function NewTicketPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Create New Ticket</h1>
                <p className="text-zinc-400">Describe your issue or request and we&apos;ll get back to you.</p>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-xl">
                <CreateTicketForm />
            </div>
        </div>
    );
}
