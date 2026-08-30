# Student Project Showcase Portal

A web-based platform for students to showcase their academic and personal projects. The system allows students to create project profiles, manage their portfolios, and share their work with other users.

The application uses **React.js**, **Node.js/Express**, **MongoDB**, and **Auth0** for authentication. Security features have been implemented throughout the application, including role-based access control, IDOR protection, input validation, XSS prevention, NoSQL injection protection, and secure HTTPS communication.

## Features

* User authentication with Auth0
* Role-based access control

  * Student
  * Recruiter
  * Admin
* Student project creation and management
* Project search and viewing
* User profiles
* Project likes and views
* Image and thumbnail uploads
* Project approval and management
* Secure API authentication using Bearer access tokens
* MongoDB Atlas database
* Local HTTPS support
* Input validation and security controls

## Security

The application includes several security measures:

* **OIDC Authentication** using Auth0 with Authorization Code Flow and PKCE
* **JWT validation** using Auth0 JWKS and RS256 signatures
* **Role-based authorization** using roles stored in MongoDB
* **IDOR protection** by verifying project ownership before updates and deletions
* **Mass assignment protection** by accepting only permitted request fields
* **NoSQL injection protection** through request validation
* **XSS protection** through input sanitization, URL validation, and React's output escaping
* **Helmet security headers**
* **Restricted CORS**
* **Request body size limits**
* **HTTPS** for local development
* Removal of legacy Google authentication and custom JWT signing

## System Architecture

```text
                  ┌─────────────────────┐
                  │       Auth0         │
                  │   OIDC / PKCE       │
                  │      JWKS           │
                  └──────────┬──────────┘
                             │
                             │ Authentication
                             ▼
┌─────────────────────┐    HTTPS    ┌─────────────────────┐
│    React Frontend   │ ──────────► │    Express Backend  │
│                     │             │                     │
│ Vite                │             │ Authentication      │
│ Tailwind CSS        │             │ Authorization        │
│ Auth0 React SDK     │             │ Validation           │
│ Axios               │             │ Security Controls    │
└─────────────────────┘             └──────────┬──────────┘
                                               │
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │    MongoDB Atlas     │
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
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   │
│   ├── test/
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
* JWT
* JWKS-RSA
* Joi
* Helmet
* CORS
* Mongoose

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

For local HTTPS, `mkcert` can be used to generate trusted development certificates.

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

The API should use **RS256** as its signing algorithm.

## Database

The application uses MongoDB Atlas with Mongoose.

The main collections include:

* Users
* Projects
* Likes
* Follows
* Notifications

Users are identified using the Auth0 `sub` claim:

```text
auth0Sub
```

Roles are stored in the database:

```text
STUDENT
RECRUITER
ADMIN
```

A new authenticated user is automatically created as a `STUDENT` when they first access the application.

## HTTPS

For local HTTPS development, `mkcert` can be used.

Generate certificates from the project root:

```bash
mkdir certs
cd certs
mkcert localhost
```

Rename the generated files to:

```text
server.crt
server.key
```

Keep the certificate files out of Git. They should be included in `.gitignore`.

## Security Testing

The backend includes automated security tests covering authentication and common security vulnerabilities.

Run:

```bash
cd backend
npm test
```

The tests cover areas such as:

* Unauthorized API access
* Authentication handling
* IDOR protection
* Mass assignment
* XSS-related input validation
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

These documents provide further details about the system architecture, authentication flow, security controls, and testing.

## Environment Variables

Environment files containing credentials and secrets should **not** be committed to Git.

Use the provided example files:

```text
backend/.env.example
frontend/.env.example
```

Create your own `.env` files locally.

## License

This project was developed as a university software project.
