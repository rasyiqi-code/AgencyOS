## 2024-04-01 - [Avoid Redundant DB Queries for Global Settings]
**Learning:** Found multiple server components in the AgencyOS frontend querying the same global system settings (e.g., AGENCY_NAME, AGENCY_LOGO) directly via `prisma.systemSetting.findMany`. In Next.js App Router, this leads to an N+1 query problem across the component tree during SSR.
**Action:** Use Next.js `unstable_cache` via the existing `getSystemSettings` utility in `lib/server/settings.ts` instead of querying Prisma directly in server components to cache these static or slowly changing settings.

## 2024-05-19 - [Applied Optimization: getSystemSettings Cache across public pages]
**Learning:** Verified that implementing `getSystemSettings` (which uses `unstable_cache`) across 10 major public entry pages drastically reduces redundant database load. No new bugs were observed during the build. This pattern is essential for performance in highly component-driven applications relying on shared static system metadata in Prisma.
**Action:** When adding new public pages that read from systemSettings table, always default to `getSystemSettings` over `prisma.systemSetting.findMany`.
