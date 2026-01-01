# Evidence Schema

**Purpose**

The Evidence table stores optional proof that a practice session occurred. Evidence always belongs to a single practice log and is used for verification, reflection, and richer context.

---

## Responsibilities

Evidence is responsible for:

* storing references to files, links, or notes
* associating proof with a specific practice session
* enforcing ownership and access rules

Evidence is not responsible for:

* validating learning quality
* calculating progress
* modifying practice logs

---

## Core Fields

| Field Name      | Type            | Required    | Description                               |
| --------------- | --------------- | ----------- | ----------------------------------------- |
| id              | UUID / ObjectId | Yes         | Primary identifier                        |
| practice_log_id | UUID / ObjectId | Yes         | Parent practice session                   |
| user_id         | UUID / ObjectId | Yes         | Owner of the evidence                     |
| type            | Enum            | Yes         | file, link, note                          |
| uri             | String          | Conditional | File path or URL (required for file/link) |
| note            | String          | Conditional | Text note (required for note type)        |
| metadata        | JSON            | No          | Size, mime type, duration, etc.           |
| created_at      | Timestamp       | Yes         | Creation time                             |
| updated_at      | Timestamp       | No          | Update time                               |

---

## Relationships

```
User (one) ──→ Evidence (many)
Practice Logs (one) ──→ Evidence (many)
```

* Evidence cannot exist without a practice log
* Deleting a practice log cascades to its evidence

---

## Validation Rules

* `type` must be one of: file, link, note
* `uri` is required for file and link types
* `note` is required for note type
* Evidence must belong to a practice log owned by the user
* Max evidence items per practice log is configurable (default: 5)

---

## Storage Notes

* Files should be stored externally (e.g., object storage)
* Database stores references and metadata only
* Large files must not be stored directly in the database

---

## Security and Access

* Users can only access their own evidence
* Evidence is read-only for analytics services
* File access should use signed URLs when applicable

---

## Lifecycle Notes

* Evidence is created after or alongside a practice log
* Updating evidence does not affect progress
* Deleting evidence does not delete the practice log

---

## Next Steps

* [ ] Define storage provider and limits
* [ ] Implement upload and link validation
* [ ] Add API endpoints for CRUD

---
