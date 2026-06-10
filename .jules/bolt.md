## 2024-06-25 - [Batching sequential database updates with Prisma transaction]
**Learning:** Sequential, dependent updates (e.g., updating an Estimate then a related Project) lead to unnecessary database round trips, acting as a minor but cumulative performance bottleneck.
**Action:** Use Prisma's `prisma.$transaction()` with an array of Promises (e.g. `Promise<unknown>[]`) to batch multiple updates into a single database operation, reducing network latency and improving write consistency.
