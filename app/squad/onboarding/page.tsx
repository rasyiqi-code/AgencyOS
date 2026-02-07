
import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { redirect } from "next/navigation";
import { SquadOnboardingForm } from "@/components/squad/onboarding-form";

export default async function SquadOnboardingPage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const existingProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id }
    });

    if (existingProfile) {
        redirect("/squad");
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                    Initialize Squad Protocol
                </h1>
                <p className="text-zinc-400">
                    Complete your profile to access classified missions.
                </p>
            </div>
            <SquadOnboardingForm user={{
                id: user.id,
                email: user.primaryEmail,
                displayName: user.displayName
            }} />
        </div>
    );
}
