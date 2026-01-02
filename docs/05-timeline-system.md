# System Build Timeline

This document defines the recommended order for building the system. Each phase depends on the completion of the phases before it. Skipping steps or building out of order increases the risk of rework and broken assumptions.

---

## Phase 1: Foundation

### 1. Users

**Dependencies:** None

**Deliverables:**

* User schema and model
* Authentication and ownership rules
* Base user API endpoints

---

### 2. Skills

**Dependencies:** Users

**Deliverables:**

* Skill schema
* Skill lifecycle rules
* User-to-skill ownership enforcement

---

## Phase 2: Activity Tracking

### 3. Practice Logs

**Dependencies:** Users, Skills

**Deliverables:**

* Practice log schema
* CRUD operations for sessions
* Validation and ownership checks

---

### 4. Evidence

**Dependencies:** Practice Logs

**Deliverables:**

* Evidence schema
* File/link/note attachment logic
* Secure access rules

---

## Phase 3: Analytics and Progress

### 5. Progress Analytics Engine

**Dependencies:** Practice Logs, Skills

**Deliverables:**

* Progress calculation logic
* Trend detection
* Stage determination

---

### 6. Aggregations and Summaries

**Dependencies:** Progress Analytics Engine

**Deliverables:**

* Weekly summaries
* Monthly summaries
* All-time statistics

---

## Phase 4: API and Integration

### 7. API Layer

**Dependencies:** All previous phases

**Deliverables:**

* Stable API contracts
* Pagination and filtering
* Error handling conventions

---

## Phase 5: Interface and Experience

### 8. UI Consumption

**Dependencies:** API Layer

**Deliverables:**

* Dashboard views
* Progress visualisation
* Skill ranking and summaries

---

## Enforcement Rule

If a feature depends on a phase that is not complete, it must not be implemented. Update this timeline before changing execution order.

---

## Exit Criteria

The system moves from design mode to build mode when:

* Phases 1–4 are complete and merged
* API contracts are agreed
* No unresolved schema decisions remain
