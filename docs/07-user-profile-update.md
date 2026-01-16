# Update User Profile Endpoint Documentation

## Overview

The update user profile endpoint allows authenticated users to modify their profile information including name, bio, and avatar URL. This endpoint follows REST principles using the PATCH HTTP method for partial resource updates.

---

## Endpoint Specifications

### URL
```
PATCH /api/auth/users/me
```

### Authentication
**Required**: Yes - Bearer token in `Authorization` header

### Content-Type
```
application/json
```

---

## Request

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
x-correlation-id: <optional_correlation_id>
```

### Body Parameters

All fields are optional, but at least one must be provided:

| Field | Type | Min Length | Max Length | Description |
|-------|------|-----------|-----------|-------------|
| `name` | string | 2 | 100 | User's display name |
| `bio` | string | 0 | 500 | User's biography or profile description |
| `avatar_url` | string | 0 | 500 | URL to user's profile avatar image |

### Example Request

```bash
curl -X PATCH http://localhost:5050/api/auth/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: req-12345" \
  -d '{
    "name": "John Smith",
    "bio": "Software engineer passionate about building scalable systems",
    "avatar_url": "https://example.com/avatars/john-smith.jpg"
  }'
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Smith",
      "email": "john@example.com",
      "bio": "Software engineer passionate about building scalable systems",
      "avatar_url": "https://example.com/avatars/john-smith.jpg",
      "preferences": {
        "timezone": "Africa/Lagos",
        "week_start": "Monday"
      },
      "last_active_at": "2026-01-16T10:30:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-16T10:30:00.000Z"
    }
  },
  "meta": {
    "message": "Profile updated successfully"
  }
}
```

**Note**: Password field is never included in the response for security reasons.

---

### Error Response: Validation Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "Name must be at least 2 characters"
    }
  }
}
```

---

### Error Response: Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

---

### Error Response: No Fields Provided (422)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No valid fields provided for update",
    "details": {
      "provided": []
    }
  }
}
```

---

## Status Codes

| Code | Reason | Description |
|------|--------|-------------|
| 200 | OK | Profile updated successfully |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | User account not found (should not occur in normal flow) |
| 422 | Unprocessable Entity | Validation error in request body |
| 500 | Internal Server Error | Unexpected server error |

---

## Validation Rules

### Name Field
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Whitespace**: Automatically trimmed on both ends
- **Required**: No (but can be updated if provided)

### Bio Field
- **Max Length**: 500 characters
- **Whitespace**: Automatically trimmed on both ends
- **Required**: No (can be cleared by not providing it)

### Avatar URL Field
- **Max Length**: 500 characters
- **Whitespace**: Automatically trimmed on both ends
- **Required**: No

---

## Business Logic

1. **Authentication Check**: Request must include valid JWT token
2. **Field Validation**: Each provided field is validated against defined rules
3. **Empty Check**: At least one field must be provided for update
4. **Database Update**: Uses MongoDB's atomic `$set` operator with validators enabled
5. **Sanitization**: Returns user data without sensitive fields (password excluded)
6. **Logging**: All profile updates are logged with correlation ID for audit trail

---

## Examples

### Example 1: Update Only Name

**Request**:
```bash
curl -X PATCH http://localhost:5050/api/auth/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson"}'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "bio": "",
      "avatar_url": "https://example.com/default-avatar.jpg"
    }
  },
  "meta": {
    "message": "Profile updated successfully"
  }
}
```

---

### Example 2: Update Name and Bio

**Request**:
```bash
curl -X PATCH http://localhost:5050/api/auth/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Wilson",
    "bio": "Full-stack developer | Open source contributor"
  }'
```

**Response**: Returns updated user with both fields modified.

---

### Example 3: Validation Error - Name Too Short

**Request**:
```bash
curl -X PATCH http://localhost:5050/api/auth/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "A"}'
```

**Response** (422):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "Name must be at least 2 characters"
    }
  }
}
```

---

### Example 4: Validation Error - Bio Too Long

**Request**:
```bash
curl -X PATCH http://localhost:5050/api/auth/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Lorem ipsum..."}'  # > 500 characters
```

**Response** (422):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "bio": "Bio must not exceed 500 characters"
    }
  }
}
```

---

### Example 5: Missing Authentication

**Request**:
```bash
curl -X PATCH http://localhost:5050/api/auth/users/me \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

**Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

---

## Implementation Notes

### Senior Backend Engineer Perspective

1. **REST Compliance**: Uses PATCH (not PUT) for partial updates, following REST best practices
2. **Atomic Operations**: MongoDB's `$set` ensures atomic database updates
3. **Validation First**: All input validated before database interaction (fail-fast principle)
4. **Error Handling**: Comprehensive error handling with specific error codes for client differentiation
5. **Logging**: Every update logged with correlation ID for audit trails and debugging
6. **Security**: Password field never exposed in responses
7. **Performance**: Single database query using `findByIdAndUpdate` (no N+1 queries)
8. **Idempotency**: PATCH requests are safe to retry (idempotent by design)

### Database Behavior

- **Update Strategy**: Uses MongoDB's atomic `$set` operator
- **Validators**: Schema validators run on update via `runValidators: true`
- **Return Value**: New updated document returned via `new: true`
- **Field Projection**: Password excluded via `.select("-password")`

---

## Testing Checklist

- ✅ Update single field (name, bio, avatar_url individually)
- ✅ Update multiple fields simultaneously
- ✅ Validate minimum/maximum field lengths
- ✅ Verify whitespace trimming
- ✅ Reject empty requests
- ✅ Reject unauthenticated requests
- ✅ Reject invalid tokens
- ✅ Verify password not returned
- ✅ Verify correlation ID propagation
- ✅ Verify error response format

---

## Integration Guide

### Frontend Integration

```javascript
async function updateUserProfile(updates, token) {
  const response = await fetch('/api/auth/users/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}

// Usage
try {
  const result = await updateUserProfile({
    name: 'John Doe',
    bio: 'My bio'
  }, userToken);
  console.log('Profile updated:', result.data.user);
} catch (error) {
  console.error('Update failed:', error.message);
}
```

---

## Related Endpoints

- `GET /api/auth/users/me` - Retrieve current user profile
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-16 | Initial release with name, bio, and avatar_url fields |

