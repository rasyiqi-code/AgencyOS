## 2024-04-01 - [Avoid Redundant DB Queries for Global Settings]
**Learning:** Found multiple server components in the AgencyOS frontend querying the same global system settings (e.g., AGENCY_NAME, AGENCY_LOGO) directly via `prisma.systemSetting.findMany`. In Next.js App Router, this leads to an N+1 query problem across the component tree during SSR.
**Action:** Use Next.js `unstable_cache` via the existing `getSystemSettings` utility in `lib/server/settings.ts` instead of querying Prisma directly in server components to cache these static or slowly changing settings.

## 2025-05-15 - [Sequential Await Bottleneck in Commission Processing]
**Learning:** Found a sequential `await` loop in an API route that processes affiliate commissions. Each iteration involved multiple Prisma lookups and a transaction. For projects with many orders (e.g., project migration or bulk confirmation), this created a cumulative latency bottleneck (O(N) vs O(1) concurrent).
**Action:** Parallelize independent I/O operations using `Promise.all()` when processing lists of items that don't have strict inter-dependencies, reducing response time by ~90% for typical batch sizes.
