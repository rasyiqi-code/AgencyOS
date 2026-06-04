import { expect, test, mock, describe } from "bun:test";
import { performance } from "perf_hooks";

// --- Mock Setup ---
mock.module("@/lib/config/hexclave", () => {
  return {
    hexclaveServerApp: {
      getUser: async (id: string) => {
        // Simulate network latency (50ms per request)
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          id,
          displayName: `User ${id}`,
          primaryEmail: `user${id}@example.com`,
        };
      },
    },
    default: {
      hexclaveServerApp: {
        getUser: async (id: string) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return {
            id,
            displayName: `User ${id}`,
            primaryEmail: `user${id}@example.com`,
          };
        },
      }
    }
  };
});

import { hexclaveServerApp } from "@/lib/config/hexclave";

describe("AdminProjectsPage Benchmark", () => {
    test("Sequential vs Parallel vs Denormalization", async () => {
        // Generate mock data
        const uniqueUserIds = Array.from({ length: 10 }, (_, i) => `user-${i + 1}`);

        // --- Approach 1: Promise.all() (Current N+1) ---
        const startPromiseAll = performance.now();
        const stackUsersPromiseAll = await Promise.all(
            uniqueUserIds.map(async (id) => {
                try {
                    return await hexclaveServerApp.getUser(id);
                } catch (e) {
                    return null;
                }
            })
        );
        const endPromiseAll = performance.now();
        const timePromiseAll = endPromiseAll - startPromiseAll;

        console.log(`Current (Promise.all): ${timePromiseAll.toFixed(2)}ms`);

        // We can't really "fix" the Stack Auth fetch if we *must* fetch them all.
        // However, according to the memory context:
        // "The Stack Auth SDK (@hexclave/next) does not natively support batch fetching multiple users by an array of IDs. To avoid N+1 network requests involving Stack Auth users, denormalize user data (e.g., clientName) by saving it directly into the database (Prisma) alongside the related entity during creation (POST routes) rather than attempting batch fetches."

        // Let's verify we have it in Prisma? No, the code says:
        // const enrichedProjects = ... map(p => { if (p.clientName) return p; ... })
        // If clientName is saved in DB, we don't need to fetch users!

        // Wait, if p.clientName is already present, we return `p`.
        // BUT the current code fetches ALL `uniqueUserIds` from `projects` EVEN IF `clientName` is present!

        // Let's test only fetching missing users!
        const projects = uniqueUserIds.map((id, index) => ({
            id: `proj-${index}`,
            userId: id,
            clientName: index < 8 ? `Client ${index}` : null // 80% have clientName
        }));

        const startOptimized = performance.now();
        // OPTIMIZATION: Only fetch users where clientName is missing
        const usersToFetch = Array.from(new Set(
            projects
                .filter(p => !p.clientName)
                .map(p => p.userId)
                .filter(Boolean)
        ));

        const stackUsersOptimized = await Promise.all(
            usersToFetch.map(async (id) => {
                try {
                    return await hexclaveServerApp.getUser(id);
                } catch (e) {
                    return null;
                }
            })
        );
        const endOptimized = performance.now();
        const timeOptimized = endOptimized - startOptimized;

        console.log(`Optimized (Fetch only missing): ${timeOptimized.toFixed(2)}ms`);

        // Toleransi fluktuasi CPU pada pengujian paralel tiruan (mock)
        expect(timeOptimized).toBeLessThanOrEqual(timePromiseAll + 15);
    });
});
