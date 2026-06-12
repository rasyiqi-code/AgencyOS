import { CreateTicketForm } from "@/components/support/create-ticket-form";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { redirect } from "next/navigation";

export default async function NewTicketPage() {
    const user = await hexclaveServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    return (
        <div className="flex flex-col gap-6">


            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-xl">
                <CreateTicketForm />
            </div>
        </div>
    );
}
