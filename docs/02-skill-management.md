# Skill Management System

**Issue:** #2  
**Status:** Planning

## Overview

This is the core of the application. Users create skills they want to learn, and the system tracks their progress through different stages.

---

## 1. What is a Skill?

A skill represents something the user wants to learn.

**Examples:**
- React
- SQL
- Graphic Design
- Public Speaking
- Spanish Language

Each skill belongs to one user only.

---

## 2. Skill Data Structure

What we store for each skill:

- **Unique ID** - System generated
- **User ID** - Who owns this skill
- **Skill Name** - What they're learning (e.g., "React")
- **Description** - Optional notes about what they want to achieve
- **Category** - Type of skill (Frontend, Backend, Design, Language, etc.)
- **Status** - Active or Archived
- **Created Date** - When they added this skill
- **Current Stage** - Beginner, Intermediate, or Advanced

---

## 3. Skill Stages

Every skill goes through stages based on practice and progress.

### The Three Stages:

**Beginner**
- Just starting out
- Learning basics
- 0-33% progress

**Intermediate**  
- Comfortable with fundamentals
- Building real things
- 34-66% progress

**Advanced**
- Confident and skilled
- Can teach others
- 67-100% progress

### Important Rules:

- Stages are NOT manually selected by users
- Progress determines the stage automatically
- A skill starts at Beginner when created
- Stage advances based on practice activity

---

## 4. Database Relationships
```
User (one) ──→ Skills (many)

One user can have many skills
Each skill belongs to exactly one user
```

**Example:**
- User: John
  - Skill 1: React
  - Skill 2: Node.js
  - Skill 3: PostgreSQL

---

## 5. Operations We Need

### Create a Skill
User adds a new skill to track
- Requires: name, optional description, category
- System sets: created date, initial stage (Beginner), status (Active)

### Read Skills
User views their skills
- Show all active skills
- Filter by category
- Sort by creation date or progress

### Update a Skill
User edits skill details
- Can change: name, description, category
- Cannot change: created date, user ID

### Archive a Skill
User stops tracking a skill
- Changes status from Active to Archived
- Does NOT delete the skill
- Archived skills don't show in main list

### Delete a Skill (Optional)
Permanently remove a skill
- Should also remove all practice logs
- Should remove all evidence
- Use with caution

---

## 6. Validation Rules

- Skill name: Required, 3-50 characters
- Description: Optional, max 500 characters
- Category: Must be from predefined list
- User cannot have duplicate skill names
- Archived skills can be reactivated

---

## 7. Category Options

Predefined categories users can choose from:

- Frontend Development
- Backend Development
- Database
- DevOps
- Design
- Language Learning
- Business Skills
- Creative Arts
- Other

These should be stored as data, not hardcoded.

---

## Next Steps

- [ ] Design database table schema
- [ ] Plan API endpoints for CRUD operations
- [ ] Define validation rules in code
- [ ] Plan how stages connect to progress calculation