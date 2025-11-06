# 🔥 StudyFire - Quick Start Guide

## 🚀 Getting Started

Your StudyFire app is now running at: **http://localhost:5173**

## 📱 App Flow

### 1️⃣ Dashboard (Home Screen)
When you first open StudyFire, you'll see:
- **Stats Bar**: Current streak, total time, and best streak
- **Motivational Message**: Dynamic feedback based on your progress
- **Create New Challenge Button**: Large orange button to start a new challenge
- **Active Challenges Grid**: All your ongoing challenges displayed as cards

### 2️⃣ Creating a Challenge

Click "Create New Challenge" and follow these 4 steps:

**Step 1: What's your challenge?**
- Enter a challenge title (e.g., "Study Math 2 hours daily")
- Add an optional description

**Step 2: Set your commitment**
- Duration: How many days (e.g., 30 days)
- Daily Target: Minutes per day (e.g., 120 minutes)
- Target Time: Optional preferred time (e.g., 8:00 PM)
- ⚠️ **WARNING**: These settings are IMMUTABLE after creation!

**Step 3: The Bet**
- Upload a file you care about (photo, video, document)
- This file gets locked forever if you break your streak
- No bet = no real accountability

**Step 4: The Oath**
- Review your commitment
- Read the terms (no edits, no excuses, no second chances)
- Click "Ignite Challenge" to commit
- 🎉 Confetti celebration!

### 3️⃣ Working on a Challenge

From the dashboard, click **"Start Session"** on any challenge card:

**Timer View:**
- Large circular progress indicator
- Real-time timer (HH:MM:SS format)
- Motivational messages that update as you progress
- Your bet file shown as a reminder of what's at stake

**Controls:**
- **Start/Resume**: Begin tracking time
- **Pause**: Temporarily stop (timer value preserved)
- **Complete Day**: Only appears when you reach your daily target

**Rules:**
- Timer cannot be manually edited
- Only real work time counts
- Must reach daily target to complete the day
- Complete before midnight or streak breaks!

### 4️⃣ Tracking Your Streak

**Fire Streak Visualization:**
- Each completed day adds a 🔥 flame icon
- Progress bar shows X/Y days completed
- Stats update in real-time

**What Happens If You Miss a Day?**
- ❌ Streak resets to 0
- 🔒 Bet file locks forever (cannot be accessed)
- ⚠️ Challenge marked as failed
- 💪 Time to create a new challenge and try again!

### ✅ **If You COMPLETE the Full Challenge**
- 🎉 Confetti celebration!
- ✅ **BET RETURNED** - Your file is safe and returned!
- 🏆 Challenge marked as "Completed" with trophy badge
- 💎 Moved to "Completed Challenges" section
- 🔓 Bet file shows in green with "BET RETURNED!" message
- 🎊 Proof of your discipline and consistency!

This is the ultimate goal - complete all days and WIN BACK your bet! 🔥

## 🎨 Key Features Explained

### 🔒 Immutable Challenges
Once you create a challenge, you **cannot**:
- Change the duration
- Modify the daily target
- Edit the challenge title
- Remove or change the bet file

**Why?** This forces honest goal-setting and prevents you from "gaming" the system when things get tough.

### ⏱️ Non-Editable Timer
The timer tracks actual working time:
- No manual time entry
- No editing past sessions
- No cheating the system
- Pure, honest tracking

**Why?** Discipline requires truth. The timer doesn't lie.

### 🎲 Bet System
The bet file creates psychological accountability:
- Upload something meaningful
- Visual reminder of what's at risk
- Creates real emotional stakes
- Motivates you to maintain consistency

**Note:** In this version, the "lock" is symbolic (localStorage-based). A backend version would implement real file encryption/deletion.

### 💬 Motivational Messages
Dynamic feedback appears throughout:
- **Encouraging** when you're doing well
- **Warning** when time is running out
- **Celebrating** at milestones (7, 14, 21, 30, 90, 100 days)
- **Sarcastic** to keep things fun but intense

## 📊 Stats Tracking

### Dashboard Stats
- **Current Streak**: Sum of all active challenge streaks
- **Total Time**: Cumulative minutes invested
- **Best Streak**: Your longest streak ever

### Per-Challenge Stats
- **Progress**: X/Y days completed
- **Daily Target**: Minutes required per day
- **Days Left**: Remaining days in challenge
- **Bet at Stake**: File name shown as reminder

## 🎮 Tips for Success

1. **Start Small**: Don't set unrealistic targets. 30 minutes is better than 3 hours you won't complete.

2. **Pick Meaningful Bets**: Upload files that actually matter to you. The emotional weight drives consistency.

3. **Be Honest**: The timer tracks real work. Don't start it unless you're actually working.

4. **Stay Consistent**: The app checks for missed days. Complete your target EVERY day, no exceptions.

5. **Celebrate Milestones**: Hit 7 days? 21 days? 30 days? Enjoy the confetti and motivation!

## 🎯 Example Use Cases

**Student Preparing for Exams**
- Challenge: "Study Calculus 90 minutes daily"
- Duration: 30 days
- Bet: Favorite vacation photo
- Result: Consistent study habit before finals

**Self-Learner Building a Skill**
- Challenge: "Code in JavaScript 2 hours daily"
- Duration: 90 days
- Bet: Family video
- Result: Portfolio project completed + strong coding habit

**Wellness Habit Formation**
- Challenge: "Meditate 30 minutes at 7 AM"
- Duration: 21 days
- Bet: Sentimental document
- Result: Morning meditation becomes automatic

## 🐛 Troubleshooting

**Timer not starting?**
- Make sure you clicked "Start Session"
- Check browser console for errors

**Confetti not showing?**
- Browser may block canvas-confetti
- Check browser permissions

**Data not persisting?**
- Clear site data in browser settings
- localStorage must be enabled

**Challenge not appearing?**
- Refresh the page
- Check browser console for errors

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Customization Ideas

Want to personalize StudyFire? You can:
- Change accent colors in `tailwind.config.js`
- Modify motivational messages in `src/utils/motivationalMessages.js`
- Adjust animations in component files
- Add custom sound effects for milestones
- Create different themes (light mode, blue fire, etc.)

## 📞 Need Help?

- Read the main `README.md` for technical details
- Check the code comments in each component
- Experiment and learn by doing!

---

**Remember: Discipline is doing what needs to be done, even when you don't want to do it.**

Now go ignite your first challenge! 🔥
