import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";

// Mock stackServerApp - MUST BE BEFORE IMPORTS
const mockGetUser = mock();
mock.module("@/lib/config/stack", () => ({
    stackServerApp: {
        getUser: mockGetUser,
    },
}));

// Mock prisma - MUST BE BEFORE IMPORTS
const mockFindUnique = mock();
mock.module("@/lib/config/db", () => ({
    prisma: {
        userPermission: {
            findUnique: mockFindUnique,
        },
    },
}));

import { getCurrentUser, hasPermission, isAdmin, canManageProjects, canManageBilling, canManageKeys } from "./auth-helpers";

describe("auth-helpers", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        mockGetUser.mockReset();
        mockFindUnique.mockReset();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("getCurrentUser", () => {
        it("should return user when logged in", async () => {
            const mockUser = { id: "user_1" };
            mockGetUser.mockResolvedValue(mockUser);
            const user = await getCurrentUser();
            expect(user).toBe(mockUser as unknown as Awaited<ReturnType<typeof getCurrentUser>>);
        });

        it("should return null when not logged in", async () => {
            mockGetUser.mockResolvedValue(null);
            const user = await getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe("hasPermission", () => {
        it("should return false if no user is logged in", async () => {
            mockGetUser.mockResolvedValue(null);
            const result = await hasPermission("test_perm");
            expect(result).toBe(false);
        });

        it("should return true if user email is in ADMIN_EMAILS", async () => {
            process.env.ADMIN_EMAILS = "admin@example.com,other@example.com";
            mockGetUser.mockResolvedValue({ id: "user_1", primaryEmail: "admin@example.com" });
            const result = await hasPermission("test_perm");
            expect(result).toBe(true);
        });

        it("should return true if user id is SUPER_ADMIN_ID", async () => {
            process.env.SUPER_ADMIN_ID = "super_admin_123";
            mockGetUser.mockResolvedValue({ id: "super_admin_123" });
            const result = await hasPermission("test_perm");
            expect(result).toBe(true);
        });

        it("should return true if local database permission exists", async () => {
            mockGetUser.mockResolvedValue({ id: "user_1" });
            mockFindUnique.mockResolvedValue({ id: "perm_1" });
            const result = await hasPermission("test_perm");
            expect(result).toBe(true);
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: {
                    userId_key: {
                        userId: "user_1",
                        key: "test_perm"
                    }
                }
            });
        });

        it("should return true if global project permission exists", async () => {
            const mockGetPermission = mock().mockResolvedValue(true);
            mockGetUser.mockResolvedValue({ id: "user_1", getPermission: mockGetPermission });
            mockFindUnique.mockResolvedValue(null);

            const result = await hasPermission("test_perm");
            expect(result).toBe(true);
            expect(mockGetPermission).toHaveBeenCalledWith("test_perm");
        });

        it("should return true if team-scoped permission exists", async () => {
            const mockGetPermission = mock().mockImplementation((arg1, arg2) => {
                if (arg1 === "team_1" && arg2 === "test_perm") return Promise.resolve(true);
                return Promise.resolve(false);
            });
            mockGetUser.mockResolvedValue({
                id: "user_1",
                selectedTeam: "team_1",
                getPermission: mockGetPermission
            });
            mockFindUnique.mockResolvedValue(null);

            const result = await hasPermission("test_perm");
            expect(result).toBe(true);
            // It calls it twice: once for global, once for team
            expect(mockGetPermission).toHaveBeenCalledWith("test_perm");
            expect(mockGetPermission).toHaveBeenCalledWith("team_1", "test_perm");
        });

        it("should return false if no permission is found", async () => {
            const mockGetPermission = mock().mockResolvedValue(false);
            mockGetUser.mockResolvedValue({
                id: "user_1",
                getPermission: mockGetPermission
            });
            mockFindUnique.mockResolvedValue(null);

            const result = await hasPermission("test_perm");
            expect(result).toBe(false);
        });
    });

    describe("isAdmin", () => {
        it("should return false if no user is logged in", async () => {
            mockGetUser.mockResolvedValue(null);
            const result = await isAdmin();
            expect(result).toBe(false);
        });

        it("should return true if user has manage_projects permission", async () => {
            // Mock hasPermission indirectly via mocks
            mockGetUser.mockResolvedValue({ id: "user_1" });
            mockFindUnique.mockImplementation(({ where }: { where: { userId_key: { key: string } } }) => {
                if (where.userId_key.key === "manage_projects") return Promise.resolve({ id: "p1" });
                return Promise.resolve(null);
            });
            const result = await isAdmin();
            expect(result).toBe(true);
        });

        it("should return true if user has team_admin in selected team", async () => {
            const mockGetPermission = mock().mockImplementation((arg1, arg2) => {
                if (arg1 === "team_1" && arg2 === "team_admin") return Promise.resolve(true);
                return Promise.resolve(false);
            });
            mockGetUser.mockResolvedValue({
                id: "user_1",
                selectedTeam: "team_1",
                getPermission: mockGetPermission
            });
            mockFindUnique.mockResolvedValue(null);

            const result = await isAdmin();
            expect(result).toBe(true);
        });

        it("should return false if no admin permissions exist", async () => {
            const mockGetPermission = mock().mockResolvedValue(false);
            mockGetUser.mockResolvedValue({
                id: "user_1",
                getPermission: mockGetPermission
            });
            mockFindUnique.mockResolvedValue(null);

            const result = await isAdmin();
            expect(result).toBe(false);
        });
    });

    describe("granular helpers", () => {
        it("canManageProjects should check manage_projects permission", async () => {
            const mockGetPermission = mock().mockResolvedValue(true);
            mockGetUser.mockResolvedValue({ id: "user_1", getPermission: mockGetPermission });
            mockFindUnique.mockResolvedValue(null);

            await canManageProjects();
            expect(mockGetPermission).toHaveBeenCalledWith("manage_projects");
        });

        it("canManageBilling should check manage_billing permission", async () => {
            const mockGetPermission = mock().mockResolvedValue(true);
            mockGetUser.mockResolvedValue({ id: "user_1", getPermission: mockGetPermission });
            mockFindUnique.mockResolvedValue(null);

            await canManageBilling();
            expect(mockGetPermission).toHaveBeenCalledWith("manage_billing");
        });

        it("canManageKeys should check manage_keys permission", async () => {
            const mockGetPermission = mock().mockResolvedValue(true);
            mockGetUser.mockResolvedValue({ id: "user_1", getPermission: mockGetPermission });
            mockFindUnique.mockResolvedValue(null);

            await canManageKeys();
            expect(mockGetPermission).toHaveBeenCalledWith("manage_keys");
        });
    });
});
