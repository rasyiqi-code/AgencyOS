// Mock cache module lokal
import { mock } from "bun:test";

mock.module("@/lib/cache", () => ({
    unstable_cache: (fn: unknown) => fn,
}));

mock.module("@/lib/server/settings", () => ({
    getSettingValue: async () => "mock",
    getSystemSettings: async () => []
}));

mock.module("@/lib/config/db", () => ({
    prisma: {}
}));
