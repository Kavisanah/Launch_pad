# Secure Student Project Showcase Portal
### Information Security Assessment 2 — Implementation & Deployment Guide

This repository hosts the secured version of the **Student Project Showcase Portal**, enhanced to fulfill the practical requirements of the Information Security Assessment 2. The legacy application has been hardened against OWASP Top 10 vulnerabilities, and custom/Google cookie logins have been replaced with a secure **OpenID Connect (OIDC) authentication pipeline via Auth0 (Authorization Code Flow with PKCE)**.

---

## 📌 Grading & Assessment Requirements Covered

- **OIDC Authentication & Logout**: Fully integrated utilizing Auth0's official React SDK and verified cryptographically on the Express backend via JSON Web Key Sets (JWKS).
- **User Information Display**: Access Token attributes are decoded on the client, and profile synchronization is run once via the backend `/api/auth/me` endpoint to display authentic user records.
- **Token Authorization Verification**: Access control middleware evaluates incoming Bearer tokens from request headers to verify identity and load database-managed user roles.
- **OWASP Top 10 Hardening**: Integrated mitigations for IDOR (Broken Access Control), NoSQL Injection, Stored XSS, Mass Assignment, Security Headers (Helmet CSP), restricted CORS, and payload size limitations.
- **Local HTTPS deployment**: Both React client and Node server configured to run securely on local HTTPS ports.
- **Database Seeding and Schema Guide**: Schema descriptions and seed routines provided for MongoDB Atlas collections.
- **Self-Contained Automated Security Tests**: Run mock security evaluations on validators, injection filters, and IDOR boundary logic.

---

## 📁 Project Structure

```text
Launch_pad
│
├── certs/                      # Git-ignored local SSL key and cert (mkcert)
├── docs/                       # Comprehensive assessment documentation
│   ├── architecture.md         # Component boundaries and diagrams
│   ├── authentication.md       # OIDC PKCE and JWKS verification specs
│   ├── security.md             # Detailed OWASP Top 10 mitigations table
│   └── security-test-report.md # Automated and manual test validation results
│
├── frontend/                   # React.js client (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/axiosInstance.js # Interceptor injecting Bearer tokens
│   │   ├── contexts/AuthContext.jsx # Auth0 authentication hooks
│   │   └── pages/auth/LoginPage.jsx # OIDC Redirect page
│   └── package.json
│
├── backend/                    # Express.js REST API server
│   ├── src/
│   │   ├── config/env.js       # App configuration and environment checker
│   │   ├── config/seed.js      # User and project database seed routine
│   │   ├── middlewares/auth.middleware.js # JWKS cryptographical validator
│   │   ├── validators/project.validator.js # Joi schemas rejecting NoSQL operators
│   │   ├── test-security.js    # Self-contained security test suite
│   │   └── server.js           # Conditional HTTPS server bootloader
│   └── package.json
│
└── README.md                   # Submission instructions and execution guide
```

---

## 🔒 Step-by-Step Configuration Guide

To deploy and demonstrate this secure application during the viva, follow these configurations:

### 1. Configure local SSL HTTPS Certificates
This project mandates HTTPS. To deploy locally under SSL:
1. Install `mkcert` (or use `openssl`):
   ```bash
   # On macOS using Homebrew
   brew install mkcert
   mkcert -install

   # On Windows using Chocolatey
   choco install mkcert
   mkcert -install
   ```
2. Create a folder named `certs` in the project root directory, navigate inside it, and generate certificates for `localhost`:
   ```bash
   mkdir certs
   cd certs
   mkcert localhost
   ```
3. This creates two files: `localhost.pem` (certificate) and `localhost-key.pem` (private key). Rename them to `server.crt` and `server.key` respectively. 
4. The certs directory and files are already git-ignored inside the root `.gitignore` to prevent secret leaks.

---

### 2. Configure Auth0 (IdP)
1. **Register Single Page Web Application**:
   - Create an application in the Auth0 dashboard under **Applications > Applications**. Select **Single Page Web Application**.
   - Configure **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins** to:
     `https://localhost:5173`
2. **Register API (Resource Server)**:
   - Create an API under **Applications > APIs**.
   - Set the **Identifier (Audience)** (e.g. `https://api.student-showcase.com`).
   - Ensure the signing algorithm is set to **RS256**.

---

### 3. Setup Environment Variables

#### Backend `.env`
Create a `.env` file inside `backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string

# Auth0 OIDC Parameters
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_ISSUER=https://your-tenant.auth0.com/

# Cloudinary Integration (Thumbnail uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client App URL
CLIENT_URL=https://localhost:5173

# Local HTTPS configuration (Paths to generated SSL certs)
HTTPS_KEY_PATH=../certs/server.key
HTTPS_CERT_PATH=../certs/server.crt
```

#### Frontend `.env`
Create a `.env` file inside `frontend/` directory:
```env
VITE_API_URL=https://localhost:5000/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_AUTH0_REDIRECT_URI=https://localhost:5173
```

---

## 📦 Deployment & Execution

### 1. Backend Server Deployment
Navigate to the `backend/` directory, install packages, and start the development server:
```bash
cd backend
npm install
npm run dev
```
If key/cert paths exist on disk, the terminal will log:
`🚀 Secure Server running on https://localhost:5000 in development mode`

#### Seed Database
Populate Mongoose collections with sample users (student, recruiter, admin) and projects:
```bash
npm run seed
```

#### Set User Roles Manually
Use this command utility to modify user permission roles in MongoDB:
```bash
# Format: node src/set-role.js <email> <STUDENT|RECRUITER|ADMIN>
node src/set-role.js student@example.edu ADMIN
```

### 2. Frontend Client Deployment
In a separate terminal shell, navigate to `frontend/`, install packages, and run the server:
```bash
cd frontend
npm install
npm run dev
```
The terminal will display:
`➜  Local:   https://localhost:5173/`

---

## 🗃 MongoDB Database Schema Guide

This application interfaces with MongoDB using **Mongoose ODM**. Below is the collection schema definition mapping out the data layers.

### 1. Users Collection
Stores user metadata and authorization roles:
```javascript
const userSchema = new Schema({
  auth0Sub: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['STUDENT', 'RECRUITER', 'ADMIN'], default: 'STUDENT' },
  bio: { type: String, default: "" },
  university: { type: String, default: "" },
  department: { type: String, default: "" },
  graduationYear: { type: Number },
  profilePicture: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
});
```

### 2. Projects Collection
Stores project profiles and owner association fields:
```javascript
const projectSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  images: [{ type: String }],
  techStack: [{ type: String }],
  demoLink: { type: String },
  githubLink: { type: String },
  category: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'], default: 'PENDING' },
  likeCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
});
```

---

## 🛡 OWASP Top 10 Hardening Details

- **IDOR Protection**: Mutation routes check ownership via database references (`project.owner.toString() === req.user.userId.toString()`). Tampering with project IDs in requests returns a `403 Forbidden` error.
- **NoSQL Injection Mitigation**: Schema inputs validate type arrays and fields. The GET routing stack uses `validateQuery` which rejects query filter keys (like `category[$ne]=WEB`) with `400 Bad Request`, protecting the MongoDB database engine.
- **Stored XSS Prevention**: User bio/text inputs are parsed using sanitizer modules before database writes. Scheme filters in Joi block links using schemes other than `http` or `https` (rejecting `javascript:` protocols). React handles dynamic DOM escaping.
- **Mass Assignment Prevention**: Controllers explicitly pick fields (`title`, `description`, etc.) from incoming payloads, ensuring attackers cannot elevate permissions or change owner fields using injected JSON parameters.
- **Security Headers & CORS**: Deploys `helmet` middleware setting safe frame, connection, and Content Security Policies, and locks CORS headers to the environment `CLIENT_URL`.
- **DoS Payload Limits**: Enforces size limitations on the Express body parser, rejecting incoming JSON payloads larger than `50kb`.

---

## 🧪 Automated Security Verification Tests

Validate all security features locally with the automated test suite. The suite launches a self-contained test server on a random port, triggers mock validation inputs, tests IDOR attempts, checks NoSQL filtering, and prints results:
```bash
cd backend
npm test
```

### Expected Output:
```text
=== RUNNING SECURITY TESTS ===
  ✅ [PASS] GET /auth/me without headers returns 401 (got 401)
  ✅ [PASS] GET /auth/me with mock header returns student profile
  ✅ [PASS] IDOR: Student B modifying Student A's project returns 403 (got 403)
  ✅ [PASS] Mass Assignment: owner field cannot be modified by client PUT requests
  ✅ [PASS] XSS: URL parameter using 'javascript:' protocol is rejected with 400 (got 400)
  ✅ [PASS] NoSQL Injection: Operator query filter category[$ne] is rejected with 400 (got 400)
=== TESTS COMPLETE: Passed 6/6 ===
```

---

## 📝 Submission & Viva Details

### 1. JSON Profile Submission File (`SE2022XXX.json`)
Create a JSON metadata profile in the root named after your student ID:
```json
{
  "sid": "SE2022XXX",
  "name": "Name with Initials",
  "app-url": "https://localhost:5173",
  "git": "https://github.com/your-username/your-repo-name",
  "blog": ["https://medium.com/@your-profile/your-security-blog-post"]
}
```

### 2. Medium Blog Outline
Write a blog documenting this security transformation. Your blog should highlight:
- **Security Aspects**: Core vulnerabilities identified (IDOR, Injection, XSS) and how they threaten showcase portal platforms.
- **Authentication Protocols**: Choosing OIDC over legacy password/cookie setups. Explaining how the OIDC PKCE flow acts as a robust standard for Single Page Applications (SPAs).
- **Implementation Strategies**: Outline of the JWT token validation logic using JWKSRSA, and custom authorize middleware check pipelines.
- **Challenges Faced**: Resolving peer dependency conflicts during local library installs under ECONNRESET, and handling read-only request properties when writing express sanitizers.
- **Learning Outcomes**: Gaining hands-on experience configuring cloud identity providers (Auth0) and implementing automated security check runners.
