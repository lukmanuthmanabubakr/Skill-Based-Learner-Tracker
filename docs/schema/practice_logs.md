# Practice Logs Schema

**Purpose**

The `practice_logs` table tracks the actual learning activity of users for each skill. Each record represents a single session of practice. This table is essential for calculating progress and generating analytics.

---

## 1. Responsibility of the Practice Logs Table

The practice_logs table is responsible for:

* Recording each learning session
* Storing metadata about the session (duration, difficulty, confidence, date)
* Acting as a parent for any session-specific evidence

It is **not** responsible for:

* Calculating skill progress (derived elsewhere)
* Maintaining skill metadata
* Handling user authentication

---

## 2. Core Fields

| Field Name        | Type            | Required | Description                          |
| ----------------- | --------------- | -------- | ------------------------------------ |
| id                | UUID / ObjectId | Yes      | Primary identifier for the log       |
| skill_id          | UUID / ObjectId | Yes      | The skill being practiced            |
| user_id           | UUID / ObjectId | Yes      | Who performed the session            |
| date_practiced    | DateTime        | Yes      | When the practice occurred           |
| duration          | Integer         | Yes      | Length of the session in minutes     |
| description       | String          | Yes      | Free text description of the session |
| difficulty_rating | Integer (1-5)   | No       | Optional difficulty of session       |
| confidence_rating | Integer (1-5)   | No       | Optional confidence level            |
| created_at        | Timestamp       | Yes      | When this record was created         |
| updated_at        | Timestamp       | No       | When this record was last updated    |

---

## 3. Relationships

```
Skills (one) ──→ Practice Logs (many)
Practice Logs (one) ──→ Evidence (many, optional)
User (one) ──→ Practice Logs (many)
```

* Each practice log belongs to **exactly one skill** and **exactly one user**
* Evidence can attach to a specific practice log

---

## 4. Indexing Strategy

Recommended indexes for fast queries:

* Compound index on (`skill_id`, `date_practiced`) for filtering by skill and time
* Index on `user_id` to query all logs by a user
* Index on `date_practiced` for analytics

---

## 5. Validation Rules

* `duration` must be a positive number and ≤ 1440 (24 hours)
* `date_practiced` cannot be in the future
* `description` is required, 10–500 characters
* `difficulty_rating` optional, 1–5
* `confidence_rating` optional, 1–5
* `skill_id` must reference an existing skill owned by `user_id`

---

## 6. Stored vs Derived Data

Stored:

* Session details (duration, description, ratings, timestamps)
* Links to skills and users

Derived (do NOT store here):

* Progress percentages
* Trends
* Total time per skill (calculated elsewhere)

---

## 7. Lifecycle Notes

* Creating a log requires a valid `skill_id` and `user_id`
* Updating a log updates `updated_at` timestamp
* Deleting a log must update cached progress or analytics immediately
* Logs cannot exist without a skill or user

---

## 8. Data Ownership Rules

* Users can only create, read, update, or delete their own logs
* Logs are tied to a skill, which is tied to a user
* Deleting a user cascades to all their logs

---

## 9. Next Steps

* [ ] Design `practice_logs` table schema in database
* [ ] Define API endpoints for CRUD operations
* [ ] Add validation logic in code
* [ ] Connect logs with progress calculation engine
