# Student Project Showcase Portal - Authentication & Token Validation

This document details the OIDC authentication architecture and backend cryptographical token validation design.

---

## OIDC Authorization Code Flow with PKCE

The application implements OIDC (OpenID Connect) authentication using the **Authorization Code Flow with Proof Key for Code Exchange (PKCE)** to secure client-side SPAs without exposing client secrets.

```
Student / Recruiter
      │
      ▼
┌──────────────┐
│  React App   │ ──(1) Authentication Redirect ──►  ┌──────────────┐
│  (Frontend)  │ ◄──(2) Code Callback & Token ────  │ Auth0 Identity │
└──────────────┘                                    │   Provider   │
      │                                             └──────────────┘
      │ (3) API Request + Access Token
      │     Authorization: Bearer <token>
      ▼
┌──────────────┐
│ Express App  │ ──(4) Retrieve Public Keys ─────►  ┌──────────────┐
│  (Backend)   │ ◄──(5) Return Signing Key ───────  │  Auth0 JWKS  │
└──────────────┘                                    └──────────────┘
      │
      │ (6) Look up / Create User
      ▼
┌──────────────┐
│   MongoDB    │
│  (Database)  │
└──────────────┘
```

### Protocol Steps

1. **Authentication Redirect**: The student/recruiter clicks the "Continue with Auth0" button. The React app redirects the browser to the Auth0 login page along with a cryptographically generated `code_challenge`.
2. **OIDC Callback**: The user authenticates on Auth0. Auth0 redirects the user back to the application redirect URI with an authorization code. The React SDK silently exchanges this code and the original `code_verifier` for an Access Token.
3. **Access Token Delivery**: The React app retrieves the access token securely in-memory and attaches it as a Bearer token in the `Authorization` header (`Authorization: Bearer <access_token>`) for all subsequent API requests.
4. **Backend Cryptographic Validation**: The Express backend intercepts the request and verifies the token signature against Auth0's public signing keys retrieved from the JSON Web Key Set (JWKS) endpoint.
5. **Claims Validation**: The backend asserts claims:
   - Signature verification using RS256 algorithm.
   - Issuer (`iss`) matches the expected Auth0 tenant.
   - Audience (`aud`) matches the registered API identifier.
   - Expiration (`exp`) has not passed.
6. **User Resolution & RBAC**: The backend extracts the verified user `sub` claim (stored as `auth0Sub` in MongoDB), looks up their profile and database-mapped `role`, and enforces role access controls (e.g. STUDENT, RECRUITER, ADMIN).

---

## Why the Backend Must Validate the Access Token

A fundamental tenet of security is: **Never trust the client.**

1. **Client-Side Bypass**: Any configurations, checks, or attributes stored on the frontend (like React state or localStorage) can be easily read, modified, or bypassed by an attacker using browser developer tools or scripts.
2. **Cryptographic Trust**: Access tokens issued by Auth0 are cryptographically signed using private keys. The backend verifies the signature using the corresponding public keys from the JWKS endpoint. This guarantees that the token was issued by the trusted identity provider and has not been tampered with or modified.
3. **Server-Side Authorization**: By resolving the user's identity from the verified cryptographic `sub` claim and loading their role directly from the secure MongoDB instance, the backend prevents privilege escalation (e.g. an attacker modifying their own client state to claim an `ADMIN` role).
