# Skills Schema

**Purpose**

This document defines the structure and responsibility of the `skills` table. A skill represents something a user is intentionally learning and tracking over time. Skills are the core domain entity of the application.

---

## 1. Responsibility of the Skills Table

The skills table is responsible for:

* Representing what a user is learning
* Acting as the parent entity for practice logs and evidence
* Holding the current learning state of a skill

It is **not** responsible for:

* Storing progress percentages
* Calculating analytics
* Tracking individual practice sessions

---

## 2. Core Fields

| Field Name    | Type            | Required | Description                         |
| ------------- | --------------- | -------- | ----------------------------------- |
| id            | UUID / ObjectId | Yes      | Primary identifier for the skill    |
| user_id       | UUID / ObjectId | Yes      | Owner of the skill                  |
| name          | String          | Yes      | Name of the skill (e.g. React, SQL) |
| description   | String          | No       | Optional learning goal or notes     |
| category      | Enum            | Yes      | Skill category                      |
| status        | Enum            | Yes      | Active or Archived                  |
| current_stage | Enum            | Yes      | Beginner, Intermediate, Advanced    |
| created_at    | Timestamp       | Yes      | When the skill was created          |
| archived_at   | Timestamp       | No       | When the skill was archived         |

---

## 3. Skill Categories

Categories classify skills for filtering and analytics.

Allowed values (data-driven, not hardcoded in logic):

* Frontend Development
* Backend Development
* Database
* DevOps
* Design
* Language Learning
* Business Skills
* Creative Arts
* Other

Categories should be stored as constants or reference data.

---

## 4. Skill Stages

Stages represent learning maturity.

Allowed values:

* Beginner
* Intermediate
* Advanced

Rules:

* A skill always starts at Beginner
* Users cannot manually change stages
* Stage changes are driven by the Progress Engine
* Stage reversal is allowed based on inactivity rules

The skills table stores the **current stage only**, not stage history.

---

## 5. Relationships

```
User (one) ──→ Skills (many)
Skills (one) ──→ Practice Logs (many)
Skills (one) ──→ Evidence (many)
```

All skill queries must be scoped by `user_id`.

---

## 6. Indexing Strategy

Recommended indexes:

* Compound index on (`user_id`, `name`) to prevent duplicates
* Index on `category`
* Index on `status`
* Index on `created_at`

These support filtering, sorting, and uniqueness enforcement.

---

## 7. Data Ownership Rules

* A skill belongs to exactly one user
* Users cannot access or modify other users’ skills
* Deleting a user affects all owned skills

Archiving a skill does not delete related data.

---

## 8. What Is Stored vs Derived

Stored:

* Skill metadata (name, description, category)
* Current stage
* Status and timestamps

Derived (must NOT be stored here):

* Progress percentage
* Total practice time
* Number of sessions
* Trends or rankings

---

## 9. Validation Rules

* Name: required, 3–50 characters
* Name must be unique per user
* Description: optional, max 500 characters
* Category: must be from allowed list
* Status: Active or Archived only
* Current stage: controlled internally

---

## 10. Lifecycle Notes

* Creating a skill sets stage to Beginner and status to Active
* Archiving a skill hides it from active views
* Archived skills may be reactivated
* Hard deletion should cascade to practice logs and evidence

---

## 11. Notes

The skills table is intentionally lean. Any data that grows with usage or time must live in related tables or be derived dynamically.
