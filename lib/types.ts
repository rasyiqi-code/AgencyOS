
import { z } from "zod";

// Zod Schemas for JSON fields
export const ScreenItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    hours: z.number().min(0),
});

export const ApiItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    hours: z.number().min(0),
});

export const EstimateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    summary: z.string(),
    screens: z.array(ScreenItemSchema),
    apis: z.array(ApiItemSchema),
    totalHours: z.number(),
    totalCost: z.number(),
    complexity: z.string(),
});

// TypeScript Interfaces inferred from Zod
export type ScreenItem = z.infer<typeof ScreenItemSchema>;
export type ApiItem = z.infer<typeof ApiItemSchema>;
export type EstimateData = z.infer<typeof EstimateSchema>;

// Extended Interface for Prisma Result (including sub-items)
// Note: Prisma returns 'JsonValue' for Json fields, so we need to cast them in UI components
export interface ExtendedEstimate {
    id: string;
    title: string;
    summary: string;
    screens: ScreenItem[];
    apis: ApiItem[];
    totalHours: number;
    totalCost: number;
    complexity: string;
    status: string;
    createdAt: Date;
    serviceId?: string | null;
    service?: {
        title: string;
        description: string;
        price: number;
        features: unknown;
        image: string | null;
    } | null;
    project?: {
        id: string;
        title: string;
        status: string;
    } | null;
}

export interface ExtendedProject {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    serviceId: string | null;
    estimateId: string | null;
    repoOwner: string | null;
    repoName: string | null;
    deployUrl: string | null;
    service?: {
        title: string;
        description: string;
        price: number;
        features: unknown;
        image: string | null;
    } | null;
    briefs: unknown[];
    feedback: unknown[];
    repoUrl: string | null; // Added this as it was missing but used in UI
}
