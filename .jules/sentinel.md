## 2024-05-18 - Securing Mutations on Promotions API
**Vulnerability:** Missing authorization check on DELETE, PATCH, and POST endpoints in the marketing promotions API.
**Learning:** When one data-mutating endpoint is secured, it is critical to review all related methods to ensure they share the same standard security checks, as missed authorization checks can leave wide-open backdoors.
**Prevention:** Apply `await isAdmin()` consistently on all app/api/marketing/ resources for data modifications.
