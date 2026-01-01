# Users Schema

**Purpose**

This document defines what is stored in the `users` table and why it exists. The users table represents application-level users and stores data required by the Skill-Based Learning Tracker. Even when using an external authentication provider, this table remains the source of truth for app-specific user data.

---

## 1. Responsibility of the Users Table

The users table is responsible for:

* Identifying a user inside the application
* Storing profile and preference data
* Acting as the root owner for all other entities

It is **not** responsible for:

* Authentication secrets (passwords, OAuth tokens)
* Session management
* Authorization logic

---

## 2. Core Fields

| Field Name     | Type            | Required | Description                                |
| -------------- | --------------- | -------- | ------------------------------------------ |
| id             | UUID / ObjectId | Yes      | Primary identifier for the user            |
| email          | String          | Yes      | User email address (unique)                |
| name           | String          | Yes      | Display name of the user                   |
| avatar_url     | String          | No       | Profile image URL                          |
| bio            | String          | No       | Short personal description                 |
| created_at     | Timestamp       | Yes      | When the account was created               |
| last_active_at | Timestamp       | No       | Last time the user interacted with the app |

---

## 3. User Preferences

User preferences control how data is displayed and calculated.

| Field Name | Type   | Required | Description                             |
| ---------- | ------ | -------- | --------------------------------------- |
| timezone   | String | Yes      | User timezone (e.g. Africa/Lagos)       |
| week_start | Enum   | Yes      | Preferred week start (Monday or Sunday) |

Preferences should be stored as explicit fields, not inferred.

---

## 4. Relationships

The user entity is the root owner of all domain data.

```
User (one)
 ├─ Skills (many)
 │   └─ Practice Logs (many)
 │       └─ Evidence (many)
```

All queries must scope data access by `user_id`.

---

## 5. Indexing Strategy

Recommended indexes:

* Unique index on `email`
* Index on `created_at`
* Index on `last_active_at`

These support authentication lookup, sorting, and activity tracking.

---

## 6. Data Ownership Rules

* A user owns their skills
* A user owns all practice logs through skills
* A user cannot access or mutate another user's data

User deletion should cascade or soft-delete all related data depending on system policy.

---

## 7. External Authentication Compatibility

If using an external provider (e.g. Clerk):

* Store provider user ID as `external_auth_id`
* Sync email and name from provider
* Do not store passwords locally

The application must always reference the internal `users.id` for relationships.

---

## 8. What Is Derived vs Stored

Stored:

* Profile information
* Preferences
* Timestamps

Derived:

* Total skills count
* Total practice time
* Activity streaks

Derived values must never be stored in this table.

---

## 9. Validation Rules

* Email must be unique and valid format
* Name must be between 2 and 50 characters
* Timezone must be a valid IANA timezone
* Week start must be Monday or Sunday

---

## 10. Notes

The users table should remain small and stable. Any data that grows over time must live in related tables, not here.
