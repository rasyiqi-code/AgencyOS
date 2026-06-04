## 2024-05-24 - Concurrent File Upload Optimization
**Learning:** Sequential network requests in frontend UI functions like file uploads create unnecessary latency because they block on each `await` instead of dispatching all network requests to the browser's queue simultaneously.
**Action:** When mapping over iterables to perform independent network requests where the backend rate-limits are manageable, prioritize wrapping individual operations in promises and resolving them concurrently using `Promise.all` or `Promise.allSettled`.
