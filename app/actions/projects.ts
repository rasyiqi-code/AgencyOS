"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { z } from "zod";

const updateProjectSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    repoUrl: z.string().optional().nullable(),
    repoOwner: z.string().optional().nullable(),
    repoName: z.string().optional().nullable(),
    deployUrl: z.string().optional().nullable(),
    developerId: z.string().optional().nullable(),
    previewUrl: z.string().optional().nullable(),
    files: z.array(z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        uploadedAt: z.string()
    })).optional(),
    bounty: z.number().optional().nullable(),
});

export async function updateProject(projectId: string, body: unknown) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    try {
        const parsed = updateProjectSchema.parse(body);
        const { developerId, ...otherUpdates } = parsed;

        const project = await prisma.$transaction(async (tx) => {
            const updated = await tx.project.update({
                where: { id: projectId },
                data: otherUpdates,
            });

            if (developerId) {
                const squadProfile = await tx.squadProfile.findUnique({
                    where: { userId: developerId }
                });

                if (squadProfile) {
                    const existingApp = await tx.missionApplication.findFirst({
                        where: {
                            missionId: projectId,
                            squadId: squadProfile.id
                        }
                    });

                    if (!existingApp) {
                        await tx.missionApplication.create({
                            data: {
                                missionId: projectId,
                                squadId: squadProfile.id,
                                status: "invited",
                            }
                        });

                        await tx.notification.create({
                            data: {
                                userId: developerId,
                                title: "New Mission Invitation",
                                content: `You have been invited to join mission: ${updated.title || 'Untitled Project'}. Check your Squad Dashboard to accept.`,
                                link: "/squad",
                                type: "invitation"
                            }
                        });

                    } else if (existingApp.status !== "accepted" && existingApp.status !== "invited") {
                        await tx.missionApplication.update({
                            where: { id: existingApp.id },
                            data: { status: "invited" }
                        });

                        await tx.notification.create({
                            data: {
                                userId: developerId,
                                title: "Mission Invitation Updated",
                                content: `You have a pending invitation for mission: ${updated.title || 'Untitled Project'}.`,
                                link: "/squad",
                                type: "invitation"
                            }
                        });
                    }
                }
            }

            return updated;
        });

        revalidatePath(`/admin/pm/${projectId}`);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, data: project };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues };
        }
        console.error("Project update error:", error);
        return { error: "Internal Server Error" };
    }
}

const validMoods = ["on_track", "delayed", "shipped"] as const;

export async function createDailyLog(projectId: string, formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const isGlobalAdmin = await isAdmin();

    if (!isGlobalAdmin) {
        const squadProfile = await prisma.squadProfile.findUnique({
            where: { userId: user.id }
        });

        if (!squadProfile) return { error: "Unauthorized" };

        const application = await prisma.missionApplication.findUnique({
            where: {
                missionId_squadId: {
                    missionId: projectId,
                    squadId: squadProfile.id
                }
            }
        });

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { developerId: true }
        });

        const isAssigned = project?.developerId === squadProfile.id;
        const isAccepted = application?.status === 'accepted';

        if (!isAssigned && !isAccepted) return { error: "Unauthorized access to this mission" };
    }

    try {
        const content = formData.get("content") as string;
        const mood = formData.get("mood") as string;
        const files = formData.getAll("images") as File[];

        if (!content?.trim()) return { error: "Content is required" };
        if (!validMoods.includes(mood as typeof validMoods[number])) return { error: "Invalid mood" };

        let uploadedUrls: string[] = [];

        if (files && files.length > 0) {
            const { uploadFile } = await import("@/lib/integrations/storage");

            const uploadPromises = files.map(async (file, index) => {
                if (file.size > 0 && file.name !== 'undefined') {
                    try {
                        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                        const path = `projects/${projectId}/daily-updates/${Date.now()}-${index}-${safeName}`;
                        return await uploadFile(file, path);
                    } catch (uploadError) {
                        console.error("Failed to upload file:", file.name, uploadError);
                        return null;
                    }
                }
                return null;
            });

            const results = await Promise.all(uploadPromises);
            uploadedUrls = results.filter((url): url is string => url !== null);
        }

        const log = await prisma.dailyLog.create({
            data: {
                projectId,
                content,
                mood: mood as "on_track" | "delayed" | "shipped",
                images: uploadedUrls
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath(`/admin/pm/${projectId}`);
        return { success: true, data: log };
    } catch (error) {
        console.error("Failed to create log:", error);
        return { error: "Internal Server Error" };
    }
}

export async function uploadProjectFile(projectId: string, formData: FormData) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    try {
        const file = formData.get("file") as File;
        if (!file) return { error: "No file provided" };

        const { uploadFile } = await import("@/lib/integrations/storage");
        const filename = `projects/${projectId}/docs/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const url = await uploadFile(file, filename);

        if (!url || (!url.startsWith("http") && !url.startsWith("/"))) {
            throw new Error("Failed to upload to R2");
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { files: true }
        });

        const currentFiles = (project?.files as unknown as { name: string; url: string; type: string; uploadedAt: string }[]) || [];

        const newFile = {
            name: file.name,
            url: url,
            type: file.type,
            uploadedAt: new Date().toISOString()
        };

        const updatedFiles = [...currentFiles, newFile];

        await prisma.project.update({
            where: { id: projectId },
            data: { files: updatedFiles }
        });

        revalidatePath(`/admin/pm/${projectId}`);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, file: newFile };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Project file upload error:", message);
        return { error: message };
    }
}

/**
 * Mengunggah gambar pratinjau proyek ke penyimpanan R2 dan memperbarui database.
 * Fungsi ini dijalankan di sisi server untuk menghindari kebocoran library Node.js ke browser.
 */
export async function uploadProjectPreview(projectId: string, formData: FormData) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    try {
        const file = formData.get("file") as File;
        if (!file) return { error: "No file provided" };

        const { uploadFile } = await import("@/lib/integrations/storage");
        const filename = `projects/${projectId}/preview/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const url = await uploadFile(file, filename);

        if (!url || (!url.startsWith("http") && !url.startsWith("/"))) {
            throw new Error("Failed to upload to R2");
        }

        await prisma.project.update({
            where: { id: projectId },
            data: { previewUrl: url }
        });

        revalidatePath(`/admin/pm/${projectId}`);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, url };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Project preview upload error:", message);
        return { error: message };
    }
}

export async function deleteProjectFile(projectId: string, fileUrl: string) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { files: true }
        });

        const currentFiles = (project?.files as unknown as { name: string; url: string; type: string; uploadedAt: string }[]) || [];
        const updatedFiles = currentFiles.filter(f => f.url !== fileUrl);

        await prisma.project.update({
            where: { id: projectId },
            data: { files: updatedFiles }
        });

        revalidatePath(`/admin/pm/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Delete project file error:", error);
        return { error: "Internal Server Error" };
    }
}

export async function updateProjectStatus(projectId: string, status: string) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    const validStatuses = ["queue", "dev", "review", "done"];
    if (!validStatuses.includes(status)) return { error: "Invalid status" };

    try {
        const project = await prisma.project.update({
            where: { id: projectId },
            data: { status }
        });

        try {
            const stackUser = await hexclaveServerApp.getUser(project.userId);
            if (stackUser && stackUser.primaryEmail) {
                const { sendProjectStatusUpdateEmail } = await import("@/lib/email/client-notifications");
                sendProjectStatusUpdateEmail({
                    to: stackUser.primaryEmail,
                    customerName: stackUser.displayName || stackUser.primaryEmail.split('@')[0] || "Client",
                    projectId: project.id,
                    projectTitle: project.title,
                    newStatus: status
                }).catch(err => console.error("Project status notification error:", err));
            }
        } catch (err) {
            console.error("Failed to fetch user for project status notification:", err);
        }

        revalidatePath(`/admin/pm/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Update Project Status Error:", error);
        return { error: "Internal Server Error" };
    }
}

export async function removeTeamMember(projectId: string, squadId: string) {
    if (!await isAdmin()) return { error: "Unauthorized" };

    try {
        await prisma.$transaction(async (tx) => {
            await tx.missionApplication.delete({
                where: {
                    missionId_squadId: {
                        missionId: projectId,
                        squadId: squadId
                    }
                }
            });

            const squadProfile = await tx.squadProfile.findUnique({
                where: { id: squadId }
            });

            if (squadProfile) {
                const project = await tx.project.findUnique({
                    where: { id: projectId },
                    select: { developerId: true }
                });

                if (project?.developerId === squadProfile.userId) {
                    await tx.project.update({
                        where: { id: projectId },
                        data: { developerId: null }
                    });
                }
            }
        });

        revalidatePath(`/admin/pm/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Remove team member error:", error);
        return { error: "Internal Server Error" };
    }
}

const createFromBriefSchema = z.object({
    title: z.string().min(1, "Title is required"),
    brief: z.string().min(1, "Brief is required"),
});

export async function createProjectFromBrief(data: unknown) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const body = createFromBriefSchema.parse(data);

        const project = await prisma.project.create({
            data: {
                userId: user.id,
                title: body.title,
                description: "Project started from AI Consultation",
                spec: body.brief,
                status: "queue",
                briefs: {
                    create: {
                        content: body.brief,
                    },
                },
            },
        });

        return { success: true, data: project };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues };
        }
        console.error("Project creation error:", error);
        return { error: "Internal Server Error" };
    }
}
