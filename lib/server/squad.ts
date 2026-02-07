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

export type ApplyMissionInput = {
    missionId: string;
    squadId: string;
    coverLetter: string;
    proposedRate?: number;
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

    async applyForMission(input: ApplyMissionInput) {
        // Check if already applied
        const existing = await prisma.missionApplication.findFirst({
            where: {
                missionId: input.missionId,
                squadId: input.squadId
            }
        });

        if (existing) {
            throw new Error("Already applied to this mission");
        }

        return await prisma.missionApplication.create({
            data: {
                missionId: input.missionId,
                squadId: input.squadId,
                coverLetter: input.coverLetter,
                proposedRate: input.proposedRate,
                status: "pending"
            }
        });
    },

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
    }
};
