# Student Project Showcase Portal - System Architecture

This document describes the high-level system architecture and component boundaries.

---

## Component Boundaries

The system is composed of three distinct physical components and a third-party identity service:

```
                  ┌──────────────────────────────┐
                  │        Auth0 (OIDC)          │
                  │  - Identity Provider         │
                  │  - OIDC PKCE Authorization   │
                  │  - JWKS Endpoint             │
                  └──────────────▲───────────────┘
                                 │
                   (1) Auth      │ (4) Public Keys
                   Redirect &    │     (JWKS)
                   Token Swap    │
                                 │
┌────────────────────────┐  (2) HTTPS API Call   ┌────────────────────────┐
│  React SPA Client      │──────────────────────►│  Express API Server    │
│  - Vite & Tailwind CSS │  Authorization:      │  - Node.js             │
│  - @auth0/auth0-react  │  Bearer <token>      │  - Token Middleware    │
│  - Axios Interceptors  │                      │  - OWASP Protections   │
└────────────────────────┘                      └───────────┬────────────┘
                                                            │
                                                            │ (3) Database Read/Write
                                                            │     & User Lookup
                                                            ▼
                                                 ┌────────────────────────┐
                                                 │      MongoDB Atlas     │
                                                 │  - User Schema (roles) │
                                                 │  - Project Records     │
                                                 │  - Social Collections  │
                                                 └────────────────────────┘
```

### 1. Frontend Client (React)
- **Vite & Tailwind CSS**: Runs locally on `https://localhost:5173`. Provides responsive pages for project creation, search, detail view, profiles, and administration.
- **Auth0 React SDK**: Integrates `@auth0/auth0-react` to run in-memory OIDC auth callback flows.
- **Axios Interceptor**: Appends the OIDC bearer access token to headers for all API requests directed at the backend.

### 2. Backend Server (Express)
- **Express API**: Runs locally on `https://localhost:5000`. Exposes REST endpoints under `/api`.
- **Auth Middleware**: Retrieves keys from the Auth0 JWKS endpoint, validates signatures, verifies claims (iss, aud, exp), looks up user roles from MongoDB, and attaches identities to `req.user`.
- **OWASP Hardening Layer**:
  - `helmet`: Sets Content Security Policy and frame controls.
  - `cors`: Locks down origins to the frontend.
  - JSON limits: Rejects request payloads greater than `50kb`.
  - Input Validators (Joi): Restricts string lengths, link protocols (rejecting `javascript:`), and filters out NoSQL query injection payloads.
  - IDOR ownership controls: Rejects unauthorized student updates or deletions.

### 3. Database Layer (MongoDB)
- **MongoDB**: Stores users (indexed by unique `auth0Sub`), project details, likes, follows, and notifications.
- **Seed Utility**: Populates database with dummy projects, notifications, and pre-configured accounts (STUDENT, RECRUITER, ADMIN) for ease of manual assessment testing.
