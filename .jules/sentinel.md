## 2024-06-08 - Missing Authorization on Admin Query Parameter
**Vulnerability:** A `GET` API route accepted an `?admin=true` query parameter to return privileged data, but failed to verify if the requester was actually an admin. Also `POST`, `PATCH`, and `DELETE` routes for the same resource were completely open.
**Learning:** It is easy to forget authorization checks when creating new CRUD routes, especially when one route (`GET`) handles both public and private data depending on a query parameter.
**Prevention:** Always verify `await isAdmin()` at the top of routes that modify global state, and specifically guard branches of logic that handle privileged read requests.
