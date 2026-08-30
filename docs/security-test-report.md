# Student Project Showcase Portal - Security Test Report

## Overview

This document contains the security tests used to verify the main security controls of the Student Project Showcase Portal.

The tests focus on authentication, authorization, IDOR, mass assignment, XSS and NoSQL injection.

## Test Cases

| Test | Security Area    | Test                                          | Expected Result     |
| ---- | ---------------- | --------------------------------------------- | ------------------- |
| 1    | Authentication   | Request protected API without token           | `401 Unauthorized`  |
| 2    | Authentication   | Request with invalid/expired token            | `401 Unauthorized`  |
| 3    | IDOR             | Student B tries to update Student A's project | `403 Forbidden`     |
| 4    | IDOR             | Student B tries to delete Student A's project | `403 Forbidden`     |
| 5    | Mass Assignment  | Send `owner` or `status` in project update    | Fields are ignored  |
| 6    | NoSQL Injection  | Send MongoDB operators in query/input         | Request is rejected |
| 7    | XSS              | Send `javascript:` as a project link          | Request is rejected |
| 8    | Input Validation | Send invalid project data                     | Validation error    |
| 9    | RBAC             | Student accesses admin-only endpoint          | `403 Forbidden`     |
| 10   | Request Limit    | Send JSON larger than 50KB                    | Request is rejected |

## Manual Testing

### Test 1 - Authentication

Send a request to a protected API without an Authorization header.

```text
GET https://localhost:5000/api/auth/me
```

Expected result:

```text
401 Unauthorized
```

### Test 2 - Invalid Token

Send an invalid or expired access token.

```text
Authorization: Bearer invalid_token
```

Expected result:

```text
401 Unauthorized
```

### Test 3 - IDOR

Log in as Student A and create a project.

Then log in as Student B and attempt to update Student A's project using its project ID.

Expected result:

```text
403 Forbidden
```

### Test 4 - Mass Assignment

Send a project update containing:

```json
{
  "title": "Updated Project",
  "owner": "another-user-id",
  "status": "APPROVED"
}
```

Expected result:

* `title` can be updated.
* `owner` cannot be changed.
* `status` cannot be changed through the student update request.

### Test 5 - XSS

Try entering:

```text
<script>alert('XSS')</script>
```

into a text field.

Also test:

```text
javascript:alert(1)
```

in a project link field.

Expected result:

* Unsafe link is rejected.
* Normal text is rendered as text rather than executable HTML.

### Test 6 - NoSQL Injection

Try a query such as:

```text
/api/projects?category[$ne]=WEB
```

Expected result:

```text
400 Bad Request
```

The malicious MongoDB operator should not be passed to the database query.

## Automated Tests

The backend security tests can be run using:

```bash
cd backend
npm test
```

The test results should be recorded below after running the tests.

| Test             | Result      |
| ---------------- | ----------- |
| Authentication   | PASS / FAIL |
| Invalid Token    | PASS / FAIL |
| IDOR             | PASS / FAIL |
| Mass Assignment  | PASS / FAIL |
| NoSQL Injection  | PASS / FAIL |
| XSS              | PASS / FAIL |
| RBAC             | PASS / FAIL |
| Input Validation | PASS / FAIL |

## Conclusion

The security tests are designed to verify that protected endpoints require authentication, users cannot access other users' projects, restricted fields cannot be modified, and malicious input is rejected.
