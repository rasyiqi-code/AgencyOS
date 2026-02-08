import { stackServerApp } from "@/lib/config/stack";
import { prisma } from "@/lib/config/db";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/squad/profile-edit-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function EditProfilePage() {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }

    const squadProfile = await prisma.squadProfile.findUnique({
        where: { userId: user.id }
    });

    if (!squadProfile) {
        redirect("/squad/onboarding");
    }

    return (
        <div className="container mx-auto px-4 pb-12 w-full max-w-3xl">
            <div className="mb-6">
                <Link href="/squad/profile" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-4">
                    <ChevronLeft className="w-4 h-4" /> Back to Profile
                </Link>
                <h1 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h1>
                <p className="text-zinc-400">Update your operative details and skills.</p>
            </div>

            <ProfileEditForm profile={squadProfile} />
        </div>
    );
}
