import { hexclaveServerApp } from "@/lib/config/hexclave";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
    const user = await hexclaveServerApp.getUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    return (
        <div className="flex flex-col gap-8 pb-10">


            <SettingsClient />
        </div>
    );
}
