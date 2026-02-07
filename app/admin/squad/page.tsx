
import { prisma } from "@/lib/config/db";

import { MissionApplicationList } from "@/components/admin/squad/mission-application-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquadProfileCard } from "@/components/admin/squad/squad-profile-card";
import { getTranslations } from "next-intl/server";

export default async function AdminSquadPage() {
    const profiles = await prisma.squadProfile.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            applications: true
        }
    });

    // Fetch projects (missions) that have pending applications
    const missionsWithApps = await prisma.project.findMany({
        where: {
            applications: {
                some: { status: 'pending' }
            }
        },
        include: {
            applications: {
                where: { status: 'pending' },
                include: {
                    squad: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const t = await getTranslations("Squad");

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{t('networkTitle')}</h1>
                <p className="text-zinc-400 mt-2">{t('networkSubtitle')}</p>
            </div>

            <Tabs defaultValue="profiles" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg mb-6">
                    <TabsTrigger value="profiles" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 rounded-md">
                        {t('profilesTab')} ({profiles.length})
                    </TabsTrigger>
                    <TabsTrigger value="missions" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 rounded-md">
                        {t('applicationsTab')} ({missionsWithApps.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profiles">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {profiles.map((profile) => (
                            <SquadProfileCard key={profile.id} profile={profile} />
                        ))}

                        {profiles.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                                <p className="text-zinc-500">{t('noProfiles')}</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="missions">
                    <MissionApplicationList missions={missionsWithApps} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
