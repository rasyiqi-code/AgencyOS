import { describe, expect, it } from "bun:test";
import { mapPrismaProjectToExtended, type PrismaProjectWithRelations } from "./mappers";

describe("mapPrismaProjectToExtended", () => {
    const baseProject = {
        id: "proj_1",
        userId: "user_1",
        title: "Test Project",
        description: "Description",
        status: "dev",
        repoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        repoName: null,
        repoOwner: null,
        deployUrl: null,
        developerId: null,
        spec: null,
        estimateId: null,
        serviceId: null,
        clientName: null,
        invoiceId: null,
        previewUrl: null,
        files: null, // Prisma returns null for empty Json
        briefs: [],
        dailyLogs: [],
        feedback: [],
        service: null,
        estimate: null,
        subscriptionEndsAt: null,
        subscriptionStatus: null,
        bounty: 0,
    };

    it("should map a basic project and handle null files correctly", () => {
        const input: PrismaProjectWithRelations = { ...baseProject };
        const result = mapPrismaProjectToExtended(input);

        expect(result.id).toBe("proj_1");
        expect(result.files).toBeUndefined(); // Should convert null to undefined
        expect(result.briefs).toHaveLength(0);
    });

    it("should map files if they exist", () => {
        const files = [{ name: "t.txt", url: "http://example.com/t.txt", type: "text", uploadedAt: "2023-01-01" }];
        // Use Type Assertion for JsonValue compatibility
        const input: PrismaProjectWithRelations = {
            ...baseProject,
            files: files as unknown as import("@prisma/client").Prisma.JsonValue
        };
        const result = mapPrismaProjectToExtended(input);

        expect(result.files).toHaveLength(1);
        expect(result.files?.[0].name).toBe("t.txt");
    });

    it("should map relations correctly", () => {
        const today = new Date();
        const input: PrismaProjectWithRelations = {
            ...baseProject,
            briefs: [{ id: "b1", projectId: "proj_1", content: "Brief", createdAt: today, attachments: null }],
            dailyLogs: [{ id: "l1", projectId: "proj_1", content: "Log", mood: "good", createdAt: today, updatedAt: today, images: [] }],
            feedback: [{ id: "f1", projectId: "proj_1", content: "FB", type: "bug", status: "open", createdAt: today, imageUrl: null, metadata: null }],
        };

        const result = mapPrismaProjectToExtended(input);

        expect(result.briefs).toHaveLength(1);
        expect(result.briefs[0].id).toBe("b1");
        expect(result.dailyLogs).toHaveLength(1);
        expect(result.feedback).toHaveLength(1);
    });
});
