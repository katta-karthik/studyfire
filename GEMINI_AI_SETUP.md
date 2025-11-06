# 🔥 Gemini AI Integration - Setup Guide

## Overview
StudyFire now uses Google's Gemini AI to generate **fresh, Duolingo-style motivational messages** every day!

## Features Added
✅ Dynamic welcome messages based on your streak  
✅ Personalized streak motivation (roasts you when lazy, celebrates when crushing it)  
✅ Daily inspirational quotes with StudyFire personality  
✅ AI-generated messages for:
- Challenge completion
- Timer start/stop
- Missed days
- Goal achievements

## Setup Instructions

### 1. Get Your Free Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Get API Key"**
3. Create a new API key (it's FREE!)
4. Copy the key

### 2. Add API Key to Your Project
1. Open the `.env` file in your project root
2. Replace `your_api_key_here` with your actual key:
   ```
   VITE_GEMINI_API_KEY=AIzaSy...your_actual_key
   ```
3. Save the file

### 3. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## How It Works

### Message Caching
- Messages are cached for **24 hours** to avoid excessive API calls
- Fresh messages appear once per day
- Different messages based on your actual performance

### Duolingo-Style Personality
The AI adopts a **savage but motivational** personality:
- **0 streak**: "Zero streak? Bold choice. Most people prefer success, but you do you. 💀"
- **Good streak**: "Look at you go! That streak is hotter than my flames! 🔥"
- **Missed day**: "Wow. You really just... gave up on yesterday, huh? Cool, cool. 😬"

### Where Messages Appear
1. **Dashboard welcome** - Personalized greeting based on your streak
2. **Streak motivation** - Changes based on current vs longest streak
3. **Daily quote** - Fresh motivational quote every day
4. **Challenge cards** - Dynamic messages when you complete milestones
5. **Timer feedback** - Reactions when you start/stop tracking time

## Customization

### Adjust Personality
Edit `src/services/geminiService.js`:
```javascript
const PERSONALITY = `You are the StudyFire mascot...`
// Change this to make it MORE savage or MORE encouraging
```

### Add More Message Types
```javascript
export async function getNewMessageType(context) {
  const prompt = `Your custom prompt here`;
  return getCachedMessage('cache_key', prompt);
}
```

## Free Tier Limits
- **60 requests per minute**
- **1500 requests per day**
- Perfect for StudyFire (messages cached for 24h)

## Troubleshooting

### Messages Not Updating?
1. Check browser console for errors
2. Verify API key in `.env` is correct
3. Make sure you restarted the dev server

### Seeing "Loading..." Forever?
1. API key might be invalid
2. Network issue - check internet connection
3. Fallback messages should appear if AI fails

### Want to Force Refresh Messages?
Clear the cache manually:
```javascript
import { clearMessageCache } from './services/geminiService';
clearMessageCache(); // Call this to force fresh messages
```

## API Key Security
⚠️ **IMPORTANT**: Never commit your `.env` file to GitHub!
- `.env` is already in `.gitignore`
- API keys in frontend are visible to users
- Gemini's free tier has built-in rate limiting
- For production, move API calls to your backend server

## Next Steps
🎯 **Test the AI messages!**
1. Complete a challenge → See AI celebration
2. Break your streak → Get roasted
3. Start timer → Hear AI hype you up
4. Check dashboard daily → Fresh quotes every day

---

**Enjoy your new AI-powered motivation system! 🔥**
