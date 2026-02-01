import { type Project, type Brief, type Feedback, type DailyLog, type FeedbackComment } from "@prisma/client";
import { type ProjectFile, type ExtendedProject } from "@/lib/types";

// Define a type that matches what Prisma returns including relations
export type PrismaProjectWithRelations = Project & {
    briefs: Brief[];
    dailyLogs: DailyLog[];
    feedback: (Feedback & { comments?: FeedbackComment[] })[];
    service: {
        title: string;
        description: string;
        price: number;
        features: unknown;
        image: string | null;
    } | null;
    estimate: {
        service: {
            title: string;
            description: string;
            price: number;
            features: unknown;
            image: string | null;
        } | null;
    } | null;
};

export function mapPrismaProjectToExtended(project: PrismaProjectWithRelations): ExtendedProject {
    // Safely cast Json to ProjectFile[] or undefined, never null
    let files: ProjectFile[] | undefined;

    if (Array.isArray(project.files)) {
        files = project.files as unknown as ProjectFile[];
    } else {
        files = undefined;
    }

    return {
        ...project,
        files,
        // Ensure service is mapped if it exists
        service: project.service ? {
            ...project.service,
        } : null,
        // Ensure other relations are passed through
        // We map specific fields to ensure compatibility with ExtendedProject interfaces
        briefs: project.briefs.map(b => ({ id: b.id, content: b.content, createdAt: b.createdAt })),
        dailyLogs: project.dailyLogs.map(l => ({ id: l.id, content: l.content, mood: l.mood, createdAt: l.createdAt })),
        feedback: project.feedback.map(f => ({
            id: f.id,
            content: f.content,
            type: f.type,
            imageUrl: f.imageUrl,
            status: f.status,
            createdAt: f.createdAt,
            comments: Array.isArray(f.comments) ? f.comments.map(c => ({
                id: c.id,
                content: c.content,
                role: c.role,
                createdAt: c.createdAt,
                imageUrl: c.imageUrl
            })) : []
        })),
    };
}
