# Progress Analytics Engine

**Issue:** #4  
**Status:** Planning

## Overview

This is what makes your app smart. Instead of users manually marking skills as "complete," the system automatically calculates progress based on their actual practice behavior.

**Key Principle:** Progress is earned through action, not claimed through buttons.

---

## 1. What is Progress?

Progress is a measurement of how far a user has advanced in learning a skill.

**It answers:**
- How much have I practiced?
- How consistent am I?
- Am I improving over time?
- What stage am I at? (Beginner, Intermediate, Advanced)

---

## 2. Progress Calculation Logic

Progress is **derived**, not stored manually.

### Inputs (Data We Use)

From Practice Logs:
- **Number of practice sessions** - How many times they practiced
- **Total practice duration** - Sum of all session durations (in hours)
- **Practice frequency** - How often they practice (daily, weekly, monthly)
- **Recency** - When was the last practice session
- **Consistency** - Are they practicing regularly or sporadically?

From Skill Data:
- **Current stage** - Beginner, Intermediate, or Advanced
- **Skill created date** - How long they've been tracking this skill

### Outputs (What We Calculate)

- **Progress Percentage** - 0% to 100%
- **Current Active Stage** - Which stage they're in now
- **Trend Direction** - Improving, Maintaining, or Declining
- **Estimated Time to Next Stage** - Based on current pace

---

## 3. Progress Percentage Formula

This is a simplified approach. You can adjust weights based on what matters most.
```
Progress = (Session Weight × 40%) + (Duration Weight × 40%) + (Consistency Weight × 20%)
```

### Session Weight (40%)
Based on number of practice sessions:
- 0-10 sessions = 0-30%
- 11-25 sessions = 31-60%
- 26-50 sessions = 61-85%
- 50+ sessions = 86-100%

### Duration Weight (40%)
Based on total time practiced:
- 0-10 hours = 0-30%
- 11-30 hours = 31-60%
- 31-60 hours = 61-85%
- 60+ hours = 86-100%

### Consistency Weight (20%)
Based on practice frequency:
- Practiced 1-2 times in last 30 days = 0-40%
- Practiced 3-6 times in last 30 days = 41-70%
- Practiced 7+ times in last 30 days = 71-100%

**Important:** These are starting values. You'll tune them based on user feedback.

---

## 4. Stage Determination

Stages are determined by progress percentage:
```
Beginner: 0-33%
Intermediate: 34-66%
Advanced: 67-100%
```

**Stage Transitions:**
- User starts at Beginner when skill is created
- Automatically moves to Intermediate at 34% progress
- Automatically moves to Advanced at 67% progress
- Cannot manually change stages

**Stage Reversal:**
- If a user stops practicing for 90+ days, progress can decay
- This prevents "Advanced" users who haven't practiced in years

---

## 5. Trend Direction

Trend shows whether the user is actively improving.

**Calculation:**
Compare last 7 days of practice to previous 7 days:
- **Improving** - More practice in recent 7 days
- **Maintaining** - Similar practice in both periods
- **Declining** - Less practice in recent 7 days
- **Inactive** - No practice in last 30 days

**Visual Indicators:**
- Improving: ↗️ Green arrow
- Maintaining: → Yellow dash
- Declining: ↘️ Orange arrow
- Inactive: ⚠️ Red warning

---

## 6. Time-Based Analytics

Users need to see their effort over time.

### Weekly Summary
For each week, calculate:
- Total practice time
- Number of sessions
- Skills practiced
- Most practiced skill

### Monthly Summary
For each month, calculate:
- Total practice time
- Number of sessions
- Average session duration
- Skills practiced
- Busiest day of the week

### All-Time Statistics
- Total time across all skills
- Total number of sessions
- Longest practice streak
- Most practiced skill
- Average daily practice time

---

## 7. Skill Ranking

Users can see which skills they've invested the most in.

**Ranking Criteria:**
1. By total practice time (most hours first)
2. By number of sessions (most sessions first)
3. By progress percentage (highest percentage first)
4. By recency (most recently practiced first)

**Example Display:**
```
1. React - 45 hours, 32 sessions, 68% (Advanced)
2. SQL - 30 hours, 28 sessions, 52% (Intermediate)
3. Design - 15 hours, 12 sessions, 28% (Beginner)
```

---

## 8. Data Aggregation Strategy

### Real-Time vs Pre-Calculated

**Real-Time (Calculated on Request):**
- Current progress percentage
- Trend direction
- Weekly summaries

**Pre-Calculated (Stored in Database):**
- Monthly summaries (too expensive to calculate every time)
- All-time totals (updated after each practice log)

**Why Both?**
- Real-time: Always accurate, but slower
- Pre-calculated: Fast, but needs updating

---

## 9. API Endpoints for Analytics

### GET /api/skills/:skillId/progress
Returns progress data for one skill:
```json
{
  "skillId": "abc123",
  "progressPercentage": 45,
  "currentStage": "Intermediate",
  "trend": "Improving",
  "totalSessions": 18,
  "totalDuration": 24.5,
  "lastPracticed": "2025-01-15"
}
```

### GET /api/analytics/weekly
Returns weekly summary for current week:
```json
{
  "weekStart": "2025-01-13",
  "weekEnd": "2025-01-19",
  "totalTime": 8.5,
  "sessionCount": 6,
  "skillsPracticed": ["React", "SQL"],
  "mostPracticedSkill": "React"
}
```

### GET /api/analytics/monthly
Returns monthly summary for current month:
```json
{
  "month": "2025-01",
  "totalTime": 32,
  "sessionCount": 24,
  "avgSessionDuration": 1.33,
  "skillsPracticed": ["React", "SQL", "Design"],
  "busiestDay": "Wednesday"
}
```

### GET /api/analytics/all-time
Returns cumulative statistics:
```json
{
  "totalTime": 150,
  "totalSessions": 98,
  "longestStreak": 14,
  "mostPracticedSkill": "React",
  "avgDailyTime": 0.82
}
```

### GET /api/skills/ranking
Returns all skills ranked by selected criteria:
```json
[
  {
    "skillId": "abc123",
    "name": "React",
    "totalTime": 45,
    "sessions": 32,
    "progress": 68,
    "rank": 1
  },
  ...
]
```

---

## 10. Performance Considerations

### Caching Strategy
- Cache progress calculations for 5 minutes
- Invalidate cache when new practice log is added
- Cache weekly/monthly summaries for 1 hour

### Database Indexing
Index these fields for fast queries:
- `practice_logs.skill_id`
- `practice_logs.user_id`
- `practice_logs.date_practiced`
- `skills.user_id`

### Pagination
- Limit practice logs to 50 per request
- Use cursor-based pagination for large datasets

---

## 11. Edge Cases to Handle

### New Users (No Practice Logs)
- Progress = 0%
- Stage = Beginner
- Trend = "Not enough data"
- Show encouraging message

### Inactive Skills (No Recent Practice)
- Progress decays slowly after 90 days
- Mark as "Inactive" in UI
- Suggest reactivating or archiving

### Deleted Practice Logs
- Recalculate progress immediately
- Update cached values
- Reflect in analytics

### Time Zone Handling
- Store all dates in UTC
- Convert to user's timezone for display
- Weekly summaries use user's week start preference (Monday or Sunday)

---

## 12. Future Enhancements

### Machine Learning Predictions
- Predict when user will reach next stage
- Suggest optimal practice schedule
- Identify skills that need attention

### Comparative Analytics
- Compare progress to similar users (anonymized)
- Show average time to reach each stage
- Skill difficulty ratings based on community data

### Goal Setting
- Let users set practice time goals
- Track goal completion rate
- Celebrate milestones

---

## Next Steps

- [ ] Implement progress calculation algorithm
- [ ] Create analytics database views/functions
- [ ] Design API endpoints
- [ ] Add caching layer
- [ ] Create analytics dashboard UI mockups
- [ ] Write unit tests for calculation logic