# 🔥 Testing the STRICT Accountability System

## ✅ Backend Running
```
🚀 Server: http://localhost:5000
💾 Database: MongoDB Atlas Connected
🔥 Ready to test!
```

---

## 🧪 Test Scenarios

### Test 1: Create Challenge WITHOUT Strict Time
**Purpose**: Test basic bet lockdown

1. Go to Challenges tab
2. Click "New Challenge"
3. Fill in:
   - Title: "Test Basic Bet Lock"
   - Duration: 2 days
   - Daily Target: 5 minutes
   - **Leave "STRICT Start Time" UNCHECKED**
4. Upload a test file (any image/document)
5. Complete the oath
6. Click "Ignite Challenge"

**Expected**:
- ✅ Challenge created
- ✅ Bet shows "🔒 BET LOCKED"
- ✅ No download button visible
- ✅ Can start session anytime

---

### Test 2: Complete a Day (Without Strict Time)
**Purpose**: Test daily completion

1. Click "Start Session" on the challenge from Test 1
2. Run timer for 5+ minutes
3. Click "Complete Day"

**Expected**:
- ✅ Confetti animation
- ✅ Day 1 completed (1/2 days)
- ✅ Bet still locked
- ✅ Can't start again today (button shows "Today's Goal Completed!")

---

### Test 3: Complete Entire Challenge
**Purpose**: Test bet unlock

1. **Wait until tomorrow** OR manually update DB to allow next day
2. Complete Day 2 (5+ minutes)

**Expected**:
- ✅ Challenge shows "Challenge Completed! 🎉"
- ✅ Bet shows "✓ BET UNLOCKED!"
- ✅ Green "Download Your Bet" button appears
- ✅ Click download → File downloads successfully
- ✅ Alert: "🎉 Downloaded: filename... You EARNED this!"

---

### Test 4: Create Challenge WITH Strict Time (FUTURE)
**Purpose**: Test strict time enforcement

1. Create new challenge
2. Set strict time to **5 minutes from now**
3. Upload bet file
4. Complete creation

**Expected**:
- ✅ Challenge shows time window
- ✅ "Start Session" button DISABLED before time
- ✅ Message: "⏰ Wait! You can start at HH:MM..."

---

### Test 5: Start During Time Window
**Purpose**: Test successful strict time compliance

1. Wait until the scheduled time arrives
2. Watch the message change to "✅ GO NOW! You have X minutes left"
3. Click "Start Session" immediately

**Expected**:
- ✅ Button ENABLED (green)
- ✅ Timer starts successfully
- ✅ Can complete session normally

---

### Test 6: Miss the Time Window (FAILURE TEST)
**Purpose**: Test automatic failure on late start

1. Create challenge with strict time
2. Set time to **1 minute from now**
3. **WAIT** until time window passes (wait 12+ minutes)
4. Try to click "Start Session"

**Expected**:
- ✅ Button DISABLED
- ✅ Message: "⛔ FAILED! You missed the time window..."
- ✅ Alert popup: "🔥 CHALLENGE FAILED! 🔥 You missed your start time..."
- ✅ Bet file DELETED from database
- ✅ Challenge shows "💀 BET DELETED"
- ✅ Button: "Challenge Failed 💀" (disabled)
- ✅ Shows failure reason below card

---

### Test 7: Verify Bet Deletion
**Purpose**: Ensure bet file is truly deleted

1. After a failed challenge (Test 6)
2. Check the bet section on card

**Expected**:
- ✅ Shows "💀 BET DELETED"
- ✅ Message: "File deleted permanently. You had your chance. 💀"
- ✅ NO download button
- ✅ Failure reason displayed

---

### Test 8: Try to Download Locked Bet (API Security)
**Purpose**: Test API security against unauthorized download

1. Get challenge ID from an active (locked) challenge
2. Open browser console
3. Run:
```javascript
const userId = localStorage.getItem('userId');
const challengeId = 'YOUR_CHALLENGE_ID_HERE';
fetch(`http://localhost:5000/api/challenges/${challengeId}/download-bet?userId=${userId}`)
  .then(r => r.json())
  .then(console.log);
```

**Expected**:
- ✅ Response: `{ message: "🔒 ACCESS DENIED. Your bet is LOCKED..." }`
- ✅ HTTP 403 Forbidden
- ✅ No file data returned

---

## 🎯 Manual Testing Checklist

### UI Elements:
- [ ] Strict time checkbox shows in Step 2
- [ ] Time input appears when checkbox enabled
- [ ] Warning text: "⚠️ You MUST start within this time + 10 min buffer"
- [ ] Oath includes strict time info when enabled
- [ ] Bet lockdown warning shows in Step 3

### Timer View:
- [ ] Time window message displays correctly
- [ ] Start button disables outside window
- [ ] Start button enables during window
- [ ] Auto-fail on late start works
- [ ] Confetti on completion
- [ ] Unlock alert on final day completion

### Challenge Card:
- [ ] Shows strict time window if enabled
- [ ] "🔒 BET LOCKED" badge for active challenges
- [ ] "✓ BET UNLOCKED!" badge for completed
- [ ] "💀 BET DELETED" badge for failed
- [ ] Download button only on completed challenges
- [ ] Failed state shows reason

### Dashboard:
- [ ] Stats update correctly
- [ ] Per-task breakdown includes failed challenges
- [ ] Today's hours calculate properly

---

## 🐛 Expected Edge Cases

### What if user refreshes during timer?
- Timer resets (by design - no cheating!)
- Session time not saved until "Complete Day" clicked

### What if user changes system time?
- Frontend checks real time
- Backend validation needed (future enhancement)

### What if user tries to edit DB directly?
- `isBetLocked` must be false AND `isCompleted` must be true
- API enforces both conditions

### What if file is too large?
- Base64 encoding increases size by ~33%
- MongoDB document limit: 16MB
- Recommend: Limit file uploads to 10MB max (future enhancement)

---

## 🚀 Quick Test Command
**For impatient testers - set strict time to 1 minute from now and watch the fire! 🔥**

1. Note current time (e.g., 10:30 PM)
2. Create challenge with strict time = current time + 1 min (10:31 PM)
3. Upload precious file
4. Complete creation
5. Watch countdown
6. At 10:31 - button enables
7. At 10:41 (10 min later) - FAILS if not started!

---

## 📊 Database Inspection
**Check MongoDB to verify data**:

```javascript
// In MongoDB Compass or Shell
db.challenges.find({ hasFailed: true })
// Should show deleted bet file data

db.challenges.find({ isCompleted: true, isBetLocked: false })
// Should show unlocked bets

db.challenges.find({ startTimeRequired: true })
// Should show strict time challenges
```

---

## ✨ Success Criteria

A FULL PASS means:
1. ✅ Bet files store as Base64 in DB
2. ✅ Cannot download until completion
3. ✅ Strict time enforces 10-min window
4. ✅ Late start = auto-fail + bet deletion
5. ✅ Completion = unlock + download works
6. ✅ Failed challenges show proper UI
7. ✅ API security prevents unauthorized access

---

**LET'S LIGHT THE FIRE! 🔥**
