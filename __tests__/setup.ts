import { mock } from "bun:test";

mock.module("next/cache", () => ({
    unstable_cache: (fn: unknown) => fn,
    revalidatePath: mock(() => {}),
    revalidateTag: mock(() => {})
}));

mock.module("@/lib/server/settings", () => ({
    getSettingValue: async () => "mock",
    getSystemSettings: async () => []
}));

mock.module("@/lib/config/db", () => ({
    prisma: {}
}));
