import { prisma } from "@/lib/config/db";

// Service layer handles pure business logic and DB operations
// independent of Next.js context (headers, cookies, revalidation)

export type CreateSquadProfileInput = {
    userId: string;
    email: string;
    name: string;
    skills: string[];
    yearsOfExp: number;
    bio?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
};



export const squadService = {
    // --- Profiles ---

    async createProfile(input: CreateSquadProfileInput) {
        return await prisma.squadProfile.create({
            data: {
                userId: input.userId,
                email: input.email,
                name: input.name,
                skills: input.skills,
                yearsOfExp: input.yearsOfExp,
                bio: input.bio,
                linkedin: input.linkedin,
                github: input.github,
                portfolio: input.portfolio,
                status: "pending"
            }
        });
    },

    async updateProfile(userId: string, data: Partial<CreateSquadProfileInput>) {
        return await prisma.squadProfile.update({
            where: { userId },
            data: {
                name: data.name,
                skills: data.skills,
                yearsOfExp: data.yearsOfExp,
                bio: data.bio,
                linkedin: data.linkedin,
                github: data.github,
                portfolio: data.portfolio,
            }
        });
    },

    async getProfile(userId: string) {
        return await prisma.squadProfile.findUnique({
            where: { userId }
        });
    },

    async approveProfile(profileId: string) {
        return await prisma.squadProfile.update({
            where: { id: profileId },
            data: { status: "vetted" }
        });
    },

    async rejectProfile(profileId: string) {
        return await prisma.squadProfile.update({
            where: { id: profileId },
            data: { status: "rejected" }
        });
    },

    // --- Mission Applications ---



    async acceptApplication(applicationId: string) {
        const application = await prisma.missionApplication.findUnique({
            where: { id: applicationId },
            include: {
                mission: true,
                squad: true
            }
        });

        if (!application) {
            throw new Error("Application not found");
        }

        // Transaction to update mission and application status
        await prisma.$transaction([
            prisma.missionApplication.update({
                where: { id: applicationId },
                data: { status: "accepted" }
            }),
            prisma.project.update({
                where: { id: application.missionId },
                data: {
                    status: "dev",
                    developerId: application.squad.userId
                }
            })
        ]);

        return true;
    },





    async respondToInvitation(applicationId: string, accept: boolean) {
        return await prisma.$transaction(async (tx) => {
            const application = await tx.missionApplication.findUnique({
                where: { id: applicationId },
                include: { mission: true }
            });

            if (!application || application.status !== 'invited') {
                throw new Error("Invitation not found or no longer valid");
            }

            if (accept) {
                // Accept invitation
                const updatedApp = await tx.missionApplication.update({
                    where: { id: applicationId },
                    data: { status: "accepted" }
                });

                // Set project to active/dev if not already
                if (application.mission.status === 'queue') {
                    await tx.project.update({
                        where: { id: application.missionId },
                        data: { status: "dev" }
                    });
                }

                // Optional: If no developerId set on project, set this user as lead (or leave it generic)
                // Optional: If no developerId set on project, set this user as lead
                if (!application.mission.developerId) {
                    const squad = await tx.squadProfile.findUnique({ where: { id: application.squadId } });
                    if (squad) {
                        await tx.project.update({
                            where: { id: application.missionId },
                            data: { developerId: squad.userId }
                        });
                    }
                }

                return updatedApp;
            } else {
                // Reject invitation
                const updatedApp = await tx.missionApplication.update({
                    where: { id: applicationId },
                    data: { status: "rejected" }
                });
                return updatedApp;
            }
        });
    }
};
