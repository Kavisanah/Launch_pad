# Student Project Showcase Portal - Security Analysis & OWASP Mitigations

This document outlines the security controls and OWASP Top 10 mitigations implemented in the Student Project Showcase Portal.

---

## Security Mitigation Matrix

| Vulnerability | Risk in Application | Mitigation Strategy | Test Verification |
| :--- | :--- | :--- | :--- |
| **A01:2021-Broken Access Control (IDOR)** | A student modifies or deletes another student's project by tampering with project IDs or request parameters. | **IDOR Protections**: The backend strictly validates project ownership by comparing `project.owner.toString() === req.user.userId.toString()`. Unauthorized updates or deletes return `403 Forbidden`. | [security.test.js](file:///c:/Users/kanak/Launch_pad/backend/src/test-security.js): Test 3 |
| **A03:2021-Injection (NoSQL)** | A malicious user manipulates queries using MongoDB query operators (e.g. `{"$ne": ""}`) in inputs or query parameters. | **Query Validation**: Joi input schemas validate all request bodies and query parameters. Unexpected operator object structures are rejected with `400 Bad Request` before database execution. | [security.test.js](file:///c:/Users/kanak/Launch_pad/backend/src/test-security.js): Test 6 |
| **A03:2021-Injection (Stored XSS)** | Malicious HTML or scripts injected in project titles, descriptions, or link fields could execute in other users' browsers. | **Input Sanitization & Output Escaping**: Profile inputs (`university`, `department`) are sanitized using `sanitize-html` before database write. Project links are restricted to `http:` and `https:` schemes in Joi schemas (rejecting `javascript:` protocols). React automatically escapes output rendered to the DOM. | [security.test.js](file:///c:/Users/kanak/Launch_pad/backend/src/test-security.js): Test 5 |
| **A04:2021-Insecure Design** | Unsecured routes or weak authorization checks allow students or recruiters to access admin-only endpoints. | **Role-Based Access Control (RBAC)**: Custom `authorize(...roles)` middleware restricts route access based on user roles stored securely in the database (`req.user.role`), never trusting user claims from the client. | [security.test.js](file:///c:/Users/kanak/Launch_pad/backend/src/test-security.js): Test 2, Test 3 |
| **A05:2021-Security Misconfiguration** | Exposure to clickjacking, MIME sniffing, and open cross-origin sharing. | **Security Headers**: Enforced Helmet headers (with a custom Content Security Policy compatible with Auth0 redirects/assets) and restricted CORS origins to the environment-configured `CLIENT_URL` (avoiding `*` wildcards). | Manual inspection of response headers and origin rejection. |
| **A07:2021-Identification & Auth Failures** | Bypassing authentication to access user profiles or project creation endpoints. | **OIDC Auth0 OIDC (PKCE)**: Removed old custom Google sign-in and local cookie tokens. Endpoints are protected by cryptographically validating the Auth0 Access Token signature against the official JWKS endpoint. | [security.test.js](file:///c:/Users/kanak/Launch_pad/backend/src/test-security.js): Test 1, Test 2 |
| **A08:2021-Software & Data Integrity Failures** | An attacker injects parameters (e.g. `role: "ADMIN"` or `owner: "another-user"`) to escalate privileges. | **Mass Assignment Mitigation**: Controllers explicitly extract allowed fields (`title`, `description`, `category`, `techStack`, `demoLink`, `githubLink`) from `req.body`, discarding any injected role or owner properties. | [security.test.js](file:///c:/Users/kanak/Launch_pad/backend/src/test-security.js): Test 4 |

---

## Other OWASP Categories (Brief Summary)

### A02:2021-Cryptographic Failures
The application mandates TLS (HTTPS) for both the frontend and backend in production and assessment setups. Sensitive cryptographic tasks (like session signing) are delegated entirely to Auth0's robust, industry-standard RS256 signing keys.

### A06:2021-Vulnerable and Outdated Components
Obsolete authentication libraries (Google auth libraries, passport strategies) have been completely purged from both the frontend and backend to minimize the attack surface.

### A09:2021-Security Logging and Monitoring Failures
The backend integrates `winston` and `morgan` to log authentication attempts, route requests, database seeds, and error stack traces to provide visibility into application usage and failures.

### A10:2021-Server-Side Request Forgery (SSRF)
All remote API integrations are strictly bound to static, predefined configurations (such as Cloudinary endpoints and Auth0 domains). The backend does not permit arbitrary client-supplied URLs to trigger server-side requests.
