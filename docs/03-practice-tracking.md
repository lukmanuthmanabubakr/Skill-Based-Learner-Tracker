# Practice Tracking System

**Issue:** #3  
**Status:** Planning

## Overview

This is where users log their actual learning activity. Every time they practice a skill, they create a practice log. This is the foundation for calculating progress automatically.

---

## 1. What is a Practice Log?

A practice log is a record of time spent learning or practicing a skill.

**Examples:**
- "Spent 2 hours building a React component"
- "Practiced SQL queries for 45 minutes"
- "Watched a design tutorial for 1 hour"

Think of it like a workout log, but for learning.

---

## 2. Practice Log Data Structure

What we store for each practice session:

- **Unique ID** - System generated
- **Skill ID** - Which skill was practiced
- **User ID** - Who practiced (for security checks)
- **Date Practiced** - When this session happened
- **Duration** - How long they practiced (in minutes)
- **What Was Practiced** - Free text description
- **Difficulty Rating** - Optional (1-5 scale: How hard was it?)
- **Confidence Rating** - Optional (1-5 scale: How confident do you feel now?)
- **Created At** - When this log was added to the system

---

## 3. Database Relationships
```
User (one) ──→ Skills (many) ──→ Practice Logs (many)

One skill can have many practice logs
Each practice log belongs to exactly one skill
```

**Example:**
- User: Sarah
  - Skill: React
    - Practice Log 1: Built todo app (2 hours)
    - Practice Log 2: Learned hooks (1.5 hours)
    - Practice Log 3: Created portfolio site (3 hours)

---

## 4. Why We Track Practice

Practice logs are used to:

1. **Calculate Progress Automatically**
   - More practice = higher progress percentage
   - Consistent practice = faster stage advancement

2. **Show Activity Timeline**
   - Users can see their learning history
   - Identify patterns (practicing more on weekends, etc.)

3. **Generate Analytics**
   - Total time spent per skill
   - Practice frequency
   - Weekly/monthly summaries

4. **Motivate Users**
   - Visual proof of effort
   - Streak tracking
   - Progress charts

---

## 5. Evidence and Resources

Users can attach evidence to prove their learning.

### What is Evidence?

Evidence is proof that learning happened. It can be:

- **Links** (GitHub repo, blog post, YouTube video, portfolio site)
- **Notes** (What they learned, key takeaways, reflections)
- **Screenshot Metadata** (Filename, size, upload date)

### Important: We Store Metadata, Not Files

We do NOT store actual images or files in the database.

We store:
- The filename
- The file size
- When it was uploaded
- Where it's stored (external service like Cloudinary or AWS S3)

### Evidence Data Structure

- **Unique ID** - System generated
- **Practice Log ID** - Which practice session (optional)
- **Skill ID** - Or directly linked to skill (optional)
- **Evidence Type** - Link, Note, or Screenshot
- **Content** - The actual URL, text, or file metadata
- **Created At** - When evidence was added

### Evidence Relationships
```
Practice Log (one) ──→ Evidence (many)
OR
Skill (one) ──→ Evidence (many)
```

Evidence can be attached to:
- A specific practice session (more common)
- Or generally to the skill (for reference materials)

---

## 6. Operations We Need

### Create Practice Log
User logs a practice session
- Requires: skill ID, date, duration, description
- Optional: difficulty rating, confidence rating
- System sets: created timestamp, user ID

### Read Practice Logs
User views their practice history
- Filter by skill
- Filter by date range
- Sort by date (newest first)
- Paginate for large lists

### Update Practice Log
User edits a practice session
- Can change: date, duration, description, ratings
- Cannot change: skill ID, user ID, created timestamp

### Delete Practice Log
Remove a practice session
- Should also delete associated evidence
- Ask for confirmation before deleting

### Add Evidence
User attaches proof to a practice log or skill
- Requires: type, content
- Optional: link to practice log

### View Evidence
User sees all evidence for a skill
- Group by practice session
- Show chronologically

---

## 7. Validation Rules

### Practice Log Validation
- Duration: Required, must be positive number, max 24 hours (1440 minutes)
- Date: Required, cannot be in the future
- Description: Required, 10-500 characters
- Difficulty rating: Optional, 1-5 only
- Confidence rating: Optional, 1-5 only
- User can only log practice for their own skills

### Evidence Validation
- Evidence type: Must be Link, Note, or Screenshot
- Link: Must be valid URL format
- Note: Max 2000 characters
- Screenshot metadata: Filename required

---

## 8. How Practice Affects Progress

This is calculated by the Progress Engine (documented separately), but here's the connection:

**Inputs from Practice Logs:**
- Total number of sessions
- Total duration across all sessions
- Frequency (how often they practice)
- Recency (last practice date)

**What Gets Calculated:**
- Progress percentage (0-100%)
- Current stage (Beginner, Intermediate, Advanced)
- Trend (improving, maintaining, declining)

**Example:**
- 10 practice sessions, 15 hours total, consistent weekly practice = 45% progress (Intermediate stage)
- 50 practice sessions, 80 hours total, daily practice = 85% progress (Advanced stage)

---

## 9. Special Features to Consider

### Practice Streaks
- Track consecutive days of practice
- Show longest streak
- Motivate daily practice

### Quick Log
- One-click logging with preset durations (15min, 30min, 1hr)
- Reduces friction for busy users

### Bulk Import
- Users can import practice history from spreadsheets
- Useful for retroactive tracking

### Reminders (Future)
- Notify users if they haven't practiced in X days
- Weekly practice goal tracking

---

## 10. Data Privacy and Security

- Users can only see their own practice logs
- Users can only add practice to their own skills
- Evidence links are not validated for safety (user responsibility)
- Practice logs can be exported (JSON or CSV)

---

## Next Steps

- [ ] Design practice_logs table schema
- [ ] Design evidence table schema
- [ ] Plan API endpoints for CRUD operations
- [ ] Define validation rules in code
- [ ] Plan integration with Progress Engine
- [ ] Design practice log UI mockups