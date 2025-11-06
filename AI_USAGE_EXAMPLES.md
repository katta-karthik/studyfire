# 🎯 Quick Guide: Adding AI Messages Anywhere

## Import the Service
```javascript
import { 
  getTimerStartMessage, 
  getTimerStopMessage,
  getChallengeCompleteMessage,
  getMissedDayMessage,
  getDailyGoalMessage 
} from '../services/geminiService';
```

## Examples

### 1. Timer Start (TimeTracker.jsx)
```javascript
const handleStartTimer = async () => {
  await startTimer(selectedChallenge._id, description);
  
  // Get AI message
  const aiMessage = await getTimerStartMessage(selectedChallenge.title);
  
  // Show toast notification with AI message
  toast.success(aiMessage);
};
```

### 2. Timer Stop (TimeTracker.jsx)
```javascript
const handleStopTimer = async () => {
  await stopTimer();
  
  // Get AI reaction
  const minutesWorked = Math.floor(elapsedSeconds / 60);
  const wasProductive = minutesWorked >= 25; // Pomodoro threshold
  const aiMessage = await getTimerStopMessage(minutesWorked, wasProductive);
  
  toast.info(aiMessage);
};
```

### 3. Challenge Complete (ChallengeCard.jsx)
```javascript
useEffect(() => {
  if (challenge.isCompleted && !hasShownMessage) {
    getChallengeCompleteMessage(
      challenge.title, 
      challenge.currentStreak, 
      challenge.duration
    ).then(message => {
      toast.success(message, { duration: 5000 });
      setHasShownMessage(true);
    });
  }
}, [challenge.isCompleted]);
```

### 4. Daily Goal Reached
```javascript
const checkDailyGoal = async (minutesLogged, targetMinutes) => {
  if (minutesLogged >= targetMinutes) {
    const message = await getDailyGoalMessage(minutesLogged, targetMinutes);
    
    // Show celebration
    confetti();
    toast.success(message);
  }
};
```

### 5. Missed Day Warning
```javascript
const checkMissedDay = async (lastCompletedDate) => {
  const daysSinceComplete = getDaysSince(lastCompletedDate);
  
  if (daysSinceComplete > 1) {
    const message = await getMissedDayMessage(challenge.currentStreak);
    toast.warning(message);
  }
};
```

## Toast Notification Setup

### Install react-hot-toast
```bash
npm install react-hot-toast
```

### Add to App.jsx
```javascript
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(249, 115, 22, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#f97316',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Your app */}
    </>
  );
}
```

## State Management for Messages

### Use State to Store AI Messages
```javascript
const [aiMessage, setAiMessage] = useState('');
const [isLoadingMessage, setIsLoadingMessage] = useState(false);

useEffect(() => {
  const loadMessage = async () => {
    setIsLoadingMessage(true);
    const message = await getWelcomeMessage(username, streak);
    setAiMessage(message);
    setIsLoadingMessage(false);
  };
  
  loadMessage();
}, [username, streak]);

return (
  <div>
    {isLoadingMessage ? (
      <p>Loading...</p>
    ) : (
      <p className="text-fire-400">{aiMessage}</p>
    )}
  </div>
);
```

## Best Practices

### ✅ DO:
- Cache messages for 24 hours (already built-in)
- Show fallback messages if API fails
- Use loading states
- Limit API calls (e.g., once per day per user)

### ❌ DON'T:
- Call AI for every single user action
- Generate messages in loops
- Skip error handling
- Expose API key in production frontend

## Performance Tips

### Preload Messages on Login
```javascript
// In Dashboard useEffect
useEffect(() => {
  async function preloadMessages() {
    await Promise.all([
      getWelcomeMessage(user.name, totalStreak),
      getStreakMotivation(totalStreak, longestStreak),
      getDailyMotivation()
    ]);
  }
  
  preloadMessages();
}, []);
```

### Clear Cache on Logout
```javascript
import { clearMessageCache } from '../services/geminiService';

const handleLogout = () => {
  clearMessageCache(); // Fresh messages for next login
  logout();
};
```

## Custom Message Types

### Create Your Own
```javascript
// In geminiService.js
export async function getCustomMessage(context) {
  const cacheKey = `custom_${context.id}_${Date.now()}`;
  
  const prompt = `You are StudyFire AI. User just ${context.action}. 
  React with ${context.tone} humor. Keep it SHORT and witty.`;
  
  return getCachedMessage(cacheKey, prompt);
}
```

### Use Anywhere
```javascript
const message = await getCustomMessage({
  id: 'unique-id',
  action: 'completed first challenge',
  tone: 'celebratory'
});
```

---

**Now go make StudyFire hilariously motivational! 🔥**
