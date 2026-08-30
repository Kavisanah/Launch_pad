# Student Project Showcase Portal

A web-based platform for students to showcase their academic and personal projects. Students can create and manage projects, build profiles, and share their work with other users.

The application is built using **React.js, Node.js, Express.js, MongoDB, and Auth0**. It includes authentication, role-based access control, project management, and security protections against common web application vulnerabilities.

## Features

* User authentication with Auth0
* Role-based access control

  * Student
  * Recruiter
  * Admin
* Student project creation and management
* Project search and browsing
* User profiles
* Project likes and views
* Image and thumbnail uploads
* Project approval and management
* Secure REST API
* MongoDB Atlas database
* HTTPS support for local development
* Input validation and security controls

## Security

The application includes the following security measures:

* OpenID Connect (OIDC) authentication using Auth0
* Authorization Code Flow with PKCE
* JWT access token validation using Auth0 JWKS
* RS256 signature verification
* Database-based role management
* IDOR protection through project ownership checks
* Mass assignment protection
* NoSQL injection protection
* XSS protection and input sanitization
* URL scheme validation
* Helmet security headers
* Restricted CORS
* Request body size limits
* HTTPS for local development
* Removal of legacy Google authentication and custom JWT signing

## System Architecture

```text
                  ┌─────────────────────┐
                  │        Auth0        │
                  │     OIDC / PKCE     │
                  │        JWKS         │
                  └──────────┬──────────┘
                             │
                             │ Authentication
                             ▼
┌─────────────────────┐    HTTPS    ┌─────────────────────┐
│    React Frontend   │ ──────────► │    Express Backend  │
│                     │             │                     │
│ Vite                │             │ Authentication      │
│ Tailwind CSS        │             │ Authorization       │
│ Auth0 React SDK     │             │ Validation          │
│ Axios               │             │ Security Controls   │
└─────────────────────┘             └──────────┬──────────┘
                                               │
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │    MongoDB Atlas    │
                                    │                     │
                                    │ Users               │
                                    │ Projects            │
                                    │ Likes               │
                                    │ Notifications       │
                                    └─────────────────────┘
```

## Project Structure

```text
Launch_pad/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   └── test-env.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── test-security.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── .env.example
│
├── certs/
├── docs/
└── README.md
```

## Technologies

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* Auth0 React SDK

### Backend

* Node.js
* Express.js
* Mongoose
* JWT
* JWKS-RSA
* Joi
* Helmet
* CORS

### Database

* MongoDB Atlas

### Authentication

* Auth0
* OpenID Connect (OIDC)
* Authorization Code Flow with PKCE
* JSON Web Tokens (JWT)
* RS256
* JSON Web Key Sets (JWKS)

## Requirements

Make sure the following are installed:

* Node.js
* npm
* MongoDB Atlas account
* Auth0 account

For local HTTPS development, `mkcert` can be used to generate trusted development certificates.

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd Launch_pad
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string

AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_ISSUER=https://your-tenant.auth0.com/

CLIENT_URL=https://localhost:5173

HTTPS_KEY_PATH=../certs/server.key
HTTPS_CERT_PATH=../certs/server.crt
```

Start the backend:

```bash
npm run dev
```

The backend will run at:

```text
https://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_API_URL=https://localhost:5000/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_AUTH0_REDIRECT_URI=https://localhost:5173
```

Start the frontend:

```bash
npm run dev
```

The application will be available at:

```text
https://localhost:5173
```

## Auth0 Configuration

Create a **Single Page Application** in the Auth0 Dashboard.

Configure the following URLs:

```text
Allowed Callback URLs:
https://localhost:5173

Allowed Logout URLs:
https://localhost:5173

Allowed Web Origins:
https://localhost:5173
```

Create an API in Auth0 and use its identifier as the `AUTH0_AUDIENCE` value.

Set the API signing algorithm to **RS256**.

## Database

The application uses **MongoDB Atlas** with **Mongoose**.

The main collections include:

* Users
* Projects
* Likes
* Follows
* Notifications

Users are linked to their Auth0 identity using the `sub` claim:

```text
auth0Sub
```

User roles are stored in the database:

```text
STUDENT
RECRUITER
ADMIN
```

New authenticated users are automatically registered as `STUDENT` users when they first access the application.

## HTTPS Setup

For local HTTPS development, `mkcert` can be used.

From the project root:

```bash
mkdir certs
cd certs
mkcert localhost
```

Rename the generated certificate files to:

```text
server.crt
server.key
```

The certificate files should not be committed to Git.

Make sure the `certs/` directory is included in `.gitignore`.

## Database Seeding

If the project includes the database seed script, sample data can be added using:

```bash
cd backend
npm run seed
```

This can be used to populate sample users, projects, and other required data.

## Security Testing

The backend contains a security test runner for checking the main security controls.

Run:

```bash
cd backend
npm test
```

The tests cover areas such as:

* Unauthorized API access
* Authentication handling
* IDOR protection
* Mass assignment protection
* XSS-related validation
* NoSQL injection protection
* Request validation

## Documentation

Additional technical documentation is available in the `docs` directory:

```text
docs/
├── architecture.md
├── authentication.md
├── security.md
└── security-test-report.md
```

These documents contain additional information about the application's architecture, authentication process, security controls, and testing.

## Environment Variables

Do not commit `.env` files, credentials, API keys, database connection strings, or private SSL keys to Git.

Use the example files provided in the project:

```text
backend/.env.example
frontend/.env.example
```

Create your own `.env` files locally.

## License

This project was developed as a university software project.
