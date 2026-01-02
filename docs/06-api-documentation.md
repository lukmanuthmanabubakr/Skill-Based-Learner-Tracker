# API Design & Contracts

This document defines how clients interact with the backend. It establishes clear, predictable rules for endpoints, request and response shapes, error handling, and access control.

The API layer is a boundary. It must be stable, boring, and consistent.

---

## Core Principles

1. **Resource-Based Design**
   Endpoints represent resources, not actions.

   * ✅ `/api/skills`
   * ❌ `/api/createSkill`

2. **Thin Controllers**
   Controllers validate input, enforce access, and delegate logic to services. Business logic must never live in controllers.

3. **Predictable Responses**
   Every endpoint returns a consistent response shape.

4. **Ownership Enforcement**
   Users can only access resources they own.

5. **Derived Data Is Not Mutated**
   Analytics and progress endpoints never modify source data.

---

## Base URL

```
/api
```

All endpoints are versioned implicitly. If breaking changes are introduced later, a versioned prefix will be added.

---

## Authentication & Authorisation

* All protected routes require authentication
* User identity is resolved before controller logic runs
* Resource ownership is validated per request

Unauthenticated requests return:

```
401 Unauthorized
```

Unauthorised access to owned resources returns:

```
403 Forbidden
```

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable explanation",
    "details": {}
  }
}
```

Error responses must never expose stack traces or internal details.

---

## Pagination

All list endpoints must support pagination.

### Query Parameters

* `limit` (default: 20, max: 100)
* `cursor` (opaque cursor value)

### Example

```
GET /api/practice-logs?limit=20&cursor=abc123
```

### Pagination Metadata

```json
"meta": {
  "nextCursor": "xyz456",
  "hasMore": true
}
```

Offset-based pagination is discouraged for large datasets.

---

## Filtering & Sorting

Filtering and sorting are explicit and opt-in.

### Examples

```
GET /api/skills?status=active
GET /api/practice-logs?skillId=abc123
GET /api/skills?sort=createdAt:desc
```

Allowed filters and sort fields must be whitelisted per endpoint.

---

## HTTP Methods

| Method | Usage             |
| ------ | ----------------- |
| GET    | Read resources    |
| POST   | Create resources  |
| PUT    | Replace resources |
| PATCH  | Partial updates   |
| DELETE | Remove resources  |

DELETE operations must require confirmation at the client level.

---

## Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Resource created      |
| 400  | Bad request           |
| 401  | Unauthenticated       |
| 403  | Forbidden             |
| 404  | Not found             |
| 422  | Validation error      |
| 500  | Internal server error |

---

## Domain Endpoints (Overview)

### Users

```
GET    /api/users/me
PATCH  /api/users/me
```

---

### Skills

```
GET    /api/skills
POST   /api/skills
GET    /api/skills/:id
PATCH  /api/skills/:id
DELETE /api/skills/:id
```

---

### Practice Logs

```
GET    /api/practice-logs
POST   /api/practice-logs
PATCH  /api/practice-logs/:id
DELETE /api/practice-logs/:id
```

---

### Evidence

```
POST   /api/evidence
GET    /api/skills/:id/evidence
DELETE /api/evidence/:id
```

---

### Analytics & Progress

```
GET /api/skills/:id/progress
GET /api/analytics/weekly
GET /api/analytics/monthly
GET /api/analytics/all-time
GET /api/skills/ranking
```

---

## Validation Rules

* Input validation happens before service logic
* Invalid input returns `422 Validation Error`
* Validation rules must be shared between API and service layers

---

## Rate Limiting (Future)

* Applied per user and IP
* More strict on write endpoints
* Analytics endpoints may have tighter limits

---

## Logging & Monitoring

* All requests have correlation IDs
* Errors are logged with severity levels
* Analytics queries are monitored for performance

---

## Exit Criteria

The API layer is ready for implementation when:

* All domain schemas are final
* Endpoint list is agreed
* Response formats are stable
* No controller-level business logic is required
