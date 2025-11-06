# Unified Timer System - Implementation Plan

## Current Issues
1. ❌ Time Tracker page and Challenges page are separate systems
2. ❌ "Today's Goal Completed" button doesn't track actual time
3. ❌ No real-time sync between pages
4. ❌ Daily strike updates immediately, not when ALL challenges complete

## New Architecture

### Core Concept
**Daily Strike = ALL challenges reach minimum time for the day**

### Data Structure Changes

#### Challenge Schema (server/models/Challenge.js)
```javascript
{
  title: String,
  dailyTargetMinutes: Number,  // e.g., 60 for 1 hour
  duration: Number,             // e.g., 30 days
  
  // NEW: Track daily progress
  dailyProgress: [{
    date: String,              // "2025-10-25"
    minutesLogged: Number,     // Actual minutes logged today
    isCompleted: Boolean,      // Hit minimum time?
    sessions: [{               // All sessions for this day
      startTime: Date,
      endTime: Date,
      duration: Number
    }]
  }],
  
  // Keep existing
  currentStreak: Number,
  totalMinutes: Number,
  completedDays: [{ date: String, isGoalReached: Boolean }],
  // ... rest
}
```

### Global Timer State (Context/Hook)
```javascript
// src/contexts/TimerContext.jsx
{
  activeTimer: {
    challengeId: String,
    challengeTitle: String,
    startTime: Date,
    elapsedSeconds: Number
  },
  
  todayProgress: {
    challengeId: {
      minutesLogged: Number,
      isCompleted: Boolean,
      targetMinutes: Number
    }
  }
}
```

### Flow

#### Starting Timer (Any Page)
1. User clicks "Start" on a challenge
2. Start timer globally
3. Update all pages in real-time
4. Show active timer in navbar/header

#### Stopping Timer
1. Calculate elapsed time
2. Add to challenge's dailyProgress for today
3. Check: Did this challenge hit minimum?
   - Yes: Mark challenge as completed for today
4. Check: Did ALL active challenges hit minimum?
   - Yes: Update daily strike! 🔥
5. Sync across all pages

#### Dashboard View
```
Today's Challenges:
✅ Meditation (60/60 min) - DONE
🔥 Exercise (45/60 min) - 15 min left
⭕ Reading (0/30 min) - Not started

Daily Strike: ❌ (Complete all to get 🔥)
```

### Pages Update

#### 1. Dashboard (DashboardView.jsx)
- Show "Today's Pending Challenges" list
- Each challenge shows: progress bar, time left, start/stop button
- Main daily strike indicator
- Real-time updates

#### 2. Challenges (ChallengesView.jsx)
- Replace "Today's Goal Completed" with Start/Stop timer
- Show today's progress for each challenge
- Sync with global timer

#### 3. Time Tracker (TimeTracker.jsx)
- Keep Clockify-style interface
- Sessions auto-link to challenges
- Updates challenge progress in real-time

### Implementation Steps

1. ✅ Create TimerContext for global state
2. ✅ Update Challenge model with dailyProgress
3. ✅ Create API endpoints:
   - POST /challenges/:id/start-session
   - POST /challenges/:id/stop-session
   - GET /challenges/today-progress
4. ✅ Update ChallengeCard - remove "completed" button, add timer
5. ✅ Create "Today's Progress" widget for Dashboard
6. ✅ Implement real-time sync across pages
7. ✅ Update daily strike logic - only when ALL complete

## User Flow Example

**Morning (8:00 AM)**
- Dashboard shows: 3 pending challenges
- Meditation (0/60), Exercise (0/60), Reading (0/30)
- Daily Strike: ❌

**Start Meditation (8:30 AM)**
- Click "Start" on Meditation
- Timer runs globally
- All pages show: Meditation timer running

**Stop Meditation (9:30 AM)**
- 60 minutes logged
- Meditation: ✅ Complete
- Check all: Exercise and Reading still pending
- Daily Strike: Still ❌

**Complete Exercise (11:00 AM)**
- 60 minutes logged
- Exercise: ✅ Complete
- Still need Reading

**Complete Reading (2:00 PM)**
- 30 minutes logged
- Reading: ✅ Complete
- ALL challenges complete → 🔥 DAILY STRIKE EARNED!

## Benefits
1. ✅ Single source of truth for time tracking
2. ✅ Real-time sync across all pages
3. ✅ Clear daily goals
4. ✅ Motivating progress tracking
5. ✅ Accurate strike system
