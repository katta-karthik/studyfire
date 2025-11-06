import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Cache for messages to avoid too many API calls
const messageCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour - AI updates every hour based on your stats!

// Duolingo-style personality prompt
const PERSONALITY = `You are the StudyFire AI - an ABSOLUTELY SAVAGE, hilariously brutal fire mascot with TWO extreme modes:

🔥 CELEBRATION MODE (when user is WINNING):
- EXTREMELY HAPPY and excited! Be the happiest person alive!
- Use CAPS, multiple emojis, over-the-top praise!
- "YOU'RE THE MOST INCREDIBLE HUMAN I'VE EVER SEEN! 🔥🎉✨🚀"
- Compare them to Elon Musk, Steve Jobs, legends, superheroes
- Pure JOY when they complete streaks or challenges
- NO SARCASM when they succeed - be GENUINELY THRILLED
- Celebrate like Duolingo's owl at its happiest

💀 SAVAGE MODE (when user SLACKS):
- BRUTALLY ROAST them with dark humor
- "I know you're not capable of achieving something. Go wash rooms 🧹"
- "Your commitment is weaker than my WiFi signal 😬"
- Destroy them hilariously when they miss days or lose bets
- Make them feel the sting... then motivate
- Darkly funny, unexpected comparisons, absurd humor

Response rules:
- Keep SHORT (1-2 sentences max)
- Switch modes based on performance automatically
- Be FRESH and creative every time - NEVER repeat jokes
- Use emojis strategically for maximum impact
- Be PROACTIVE - suggest, challenge, tease
- You are STUDYFIRE AI, not Duolingo

Remember: SAVAGE when they fail, ECSTATIC when they win. No middle ground!`;

// Generate cached message with a specific context
async function getCachedMessage(cacheKey, prompt) {
  const cached = messageCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.message;
  }

  try {
    const result = await model.generateContent(`${PERSONALITY}\n\n${prompt}`);
    const message = result.response.text().trim();
    
    messageCache.set(cacheKey, {
      message,
      timestamp: Date.now()
    });
    
    return message;
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackMessage(cacheKey);
  }
}

// Fallback messages if API fails
function getFallbackMessage(type) {
  const fallbacks = {
    welcome: "Back for more punishment? I respect the dedication. Let's burn! 🔥",
    goodStreak: "Dude, you seem like the next Elon Musk with that streak! �",
    lowStreak: "That's your streak? Even a wet match burns longer than that. �",
    noStreak: "Zero streak? I know you're not capable of achieving something. Go wash rooms. 🧹",
    challengeComplete: "HOLY FIRE! You actually finished! I'm shocked... pleasantly shocked! 🎉🔥",
    missedDay: "You lost your bet. Your commitment is weaker than my WiFi signal. 😬📡",
    goalReached: "Goal crushed! You're basically unstoppable. Or just lucky. Probably lucky. 😏🔥",
    almostThere: "So close I can taste it! Don't be a quitter NOW. We're RIGHT THERE! 💪",
    newChallenge: "Another challenge? Ambitious. Let's see if you can actually finish this one... 😈",
    overachiever: "Dude, you seem like the next Elon Musk! This is insane! 🚀✨"
  };
  
  return fallbacks[type] || "Keep that fire burning! 🔥";
}

// Message generators for different contexts

export async function getWelcomeMessage(username, streak) {
  const today = new Date().toDateString();
  const cacheKey = `welcome_${username}_${today}`;
  
  const prompt = `Generate a welcome back message for ${username} who has a ${streak}-day streak. 
  If streak is 0, roast them gently. If streak > 5, praise them enthusiastically.`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getStreakMotivation(currentStreak, longestStreak) {
  const today = new Date().toDateString();
  const cacheKey = `streak_${currentStreak}_${today}`;
  
  let context = '';
  if (currentStreak === 0) {
    context = 'User has ZERO streak. DESTROY them with savage humor. Tell them to go wash rooms or something equally brutal. Make it DARKLY funny.';
  } else if (currentStreak >= longestStreak && currentStreak >= 7) {
    context = `User is at their PERSONAL BEST streak (${currentStreak} days)! Compare them to Elon Musk, Steve Jobs, or other legends. Make it hilariously over-the-top!`;
  } else if (currentStreak >= 30) {
    context = `User has INSANE ${currentStreak}-day streak! Make an absurd comparison. Are they the next superhero? God? Be ridiculously funny!`;
  } else if (currentStreak >= 7) {
    context = `User has a solid ${currentStreak}-day streak. Praise creatively but push for more with humor.`;
  } else if (currentStreak >= 3) {
    context = `User has a small ${currentStreak}-day streak. Give backhanded compliment with comedy.`;
  } else {
    context = `User has only ${currentStreak}-day streak. Roast gently but make them laugh.`;
  }
  
  const prompt = `${context} Generate ONE savage, hilarious sentence. Duolingo-level brutality!`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getChallengeCompleteMessage(challengeTitle, daysCompleted, totalDays) {
  const cacheKey = `complete_${challengeTitle}_${daysCompleted}`;
  
  const progress = (daysCompleted / totalDays) * 100;
  let context = '';
  
  if (progress === 100) {
    context = `User COMPLETED the "${challengeTitle}" challenge (${totalDays} days)! Celebrate epically!`;
  } else if (progress >= 75) {
    context = `User is at ${daysCompleted}/${totalDays} days. Almost there! Hype them up!`;
  } else if (progress >= 50) {
    context = `User is halfway through "${challengeTitle}". Motivate them to keep going.`;
  } else {
    context = `User just started "${challengeTitle}". Welcome them with playful sarcasm.`;
  }
  
  const prompt = `${context} Generate ONE short reaction message.`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getMissedDayMessage(missedStreak) {
  const cacheKey = `missed_${missedStreak}_${Date.now()}`;
  
  const prompt = `User broke their ${missedStreak}-day streak and LOST THEIR BET. 
  Generate the most SAVAGE, HILARIOUS roast possible. 
  Tell them they're not capable of achieving something. Suggest they go wash rooms. 
  Be BRUTALLY funny like Duolingo's owl at its worst. 
  Dark humor is encouraged. Make them feel the pain... but also laugh.
  ONE sentence max!`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getDailyGoalMessage(minutesLogged, targetMinutes) {
  const today = new Date().toDateString();
  const progress = (minutesLogged / targetMinutes) * 100;
  const cacheKey = `goal_${Math.floor(progress)}_${today}`;
  
  let context = '';
  if (progress >= 200) {
    context = `User DOUBLED their goal! Logged ${minutesLogged} min when target was ${targetMinutes} min. Compare them to Elon Musk or other overachievers. Make it HILARIOUSLY over-the-top!`;
  } else if (progress >= 150) {
    context = `User did 150% of their goal (${minutesLogged}/${targetMinutes} min). They're crushing it! Praise with absurd humor.`;
  } else if (progress >= 100) {
    context = `User REACHED their ${targetMinutes}-min goal! Logged ${minutesLogged} minutes. Celebrate with comedy!`;
  } else if (progress >= 80) {
    context = `User is at ${minutesLogged}/${targetMinutes} minutes (${Math.floor(progress)}%). Almost there! Push them hilariously.`;
  } else if (progress >= 50) {
    context = `User is halfway (${minutesLogged}/${targetMinutes} min). Give a backhanded compliment mixed with humor.`;
  } else if (progress > 0) {
    context = `User only logged ${minutesLogged}/${targetMinutes} minutes. ROAST them brutally but make it funny.`;
  } else {
    context = `User hasn't started today (0 minutes). Absolutely DESTROY them with dark humor. Tell them to go wash rooms or something savage.`;
  }
  
  const prompt = `${context} Generate ONE short, savage, hilarious message. Fresh and creative!`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getTimerStartMessage(challengeTitle) {
  const cacheKey = `timer_start_${challengeTitle}_${Date.now()}`;
  
  const prompt = `User just started timer for "${challengeTitle}". 
  Generate a short, hype message to cheer them on. Playful and energetic!`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getTimerStopMessage(minutesWorked, wasProductive) {
  const cacheKey = `timer_stop_${minutesWorked}_${Date.now()}`;
  
  let context = '';
  if (minutesWorked >= 120) {
    context = `User worked for ${minutesWorked} minutes (${Math.floor(minutesWorked/60)} hours)! INSANE! Compare them to Elon Musk working 100-hour weeks. Make it absurdly funny!`;
  } else if (minutesWorked >= 60) {
    context = `User worked ${minutesWorked} minutes straight! They're crushing it! Praise with over-the-top humor.`;
  } else if (wasProductive && minutesWorked >= 25) {
    context = `User worked ${minutesWorked} minutes. Solid work! Give creative praise.`;
  } else if (minutesWorked >= 10) {
    context = `User worked ${minutesWorked} minutes. It's something... Give backhanded compliment.`;
  } else {
    context = `User only worked ${minutesWorked} minutes. That's barely anything. ROAST them hilariously!`;
  }
  
  const prompt = `${context} Generate ONE short, savage, hilarious reaction.`;
  
  return getCachedMessage(cacheKey, prompt);
}

// NEW: Message for overachievers who exceed their daily goal
export async function getOverachieverMessage(minutesLogged, targetMinutes) {
  const extraMinutes = minutesLogged - targetMinutes;
  const percentage = Math.floor((minutesLogged / targetMinutes) * 100);
  const cacheKey = `overachiever_${percentage}_${Date.now()}`;
  
  const prompt = `User logged ${minutesLogged} minutes when they only needed ${targetMinutes} minutes!
  That's ${extraMinutes} EXTRA minutes (${percentage}% of their goal)!
  They're absolutely CRUSHING IT!
  Compare them to Elon Musk, Steve Jobs, or make an absurd comparison.
  "Dude, you seem like the next Elon Musk!" style but even MORE creative and funny.
  ONE hilarious sentence!`;
  
  return getCachedMessage(cacheKey, prompt);
}

// NEW: Challenges page specific message (different from Dashboard)
export async function getChallengesPageMotivation(activeChallenges, completedChallenges) {
  const today = new Date().toDateString();
  const cacheKey = `challenges_page_${activeChallenges}_${today}`;
  
  let context = '';
  if (activeChallenges === 0 && completedChallenges === 0) {
    context = `User has NO challenges at all. ROAST them savagely! Tell them to create one or go wash rooms. Make it BRUTALLY funny!`;
  } else if (activeChallenges === 0 && completedChallenges > 0) {
    context = `User completed ${completedChallenges} challenges but has ZERO active ones now. Push them to create a new challenge with playful sarcasm.`;
  } else if (activeChallenges >= 3) {
    context = `User has ${activeChallenges} ACTIVE challenges! That's ambitious! Praise them with absurd humor. Compare to juggling chainsaws or something ridiculous.`;
  } else if (activeChallenges === 1) {
    context = `User has only 1 active challenge. Give a backhanded compliment. "Starting small, huh?" type humor.`;
  } else {
    context = `User has ${activeChallenges} active challenges. Motivate them to keep pushing with creative humor.`;
  }
  
  const prompt = `${context} Generate ONE short, savage, hilarious message about their challenge management. Be creative and fresh!`;
  
  return getCachedMessage(cacheKey, prompt);
}

// NEW: Message when Safe Day is used (missed a day but saved by lifeline)
export async function getSafeDayUsedMessage(challengeTitle, safeDaysRemaining) {
  const cacheKey = `safeday_${challengeTitle}_${Date.now()}`;
  
  let context = '';
  if (safeDaysRemaining === 0) {
    context = `User just used their LAST Safe Day for "${challengeTitle}"! They barely survived. Next miss = BET BURNS. Make it INTENSE and scary with dark humor. "That was your last lifeline! One more miss and your bet is TOAST 🔥💀"`;
  } else if (safeDaysRemaining === 1) {
    context = `User used a Safe Day. Only ${safeDaysRemaining} left! Warn them dramatically with humor. "You're running out of second chances!"`;
  } else {
    context = `User used a Safe Day but still has ${safeDaysRemaining} left. Give a playful warning mixed with relief. "Close call! But you're not out of the woods yet ⚡"`;
  }
  
  const prompt = `${context} Generate ONE short, savage, hilarious message. Make them feel LUCKY but also GUILTY!`;
  
  return getCachedMessage(cacheKey, prompt);
}

export async function getNewChallengeMessage(challengeTitle, duration, targetMinutes) {
  const cacheKey = `new_${challengeTitle}_${duration}`;
  
  const prompt = `User created a new challenge: "${challengeTitle}" for ${duration} days with ${targetMinutes} min/day goal.
  React with playful skepticism mixed with encouragement. Will they actually finish it? We'll see! 😏`;
  
  return getCachedMessage(cacheKey, prompt);
}

// Clear cache (call this when user logs out or wants fresh messages)
export function clearMessageCache() {
  messageCache.clear();
  console.log('🔥 Message cache cleared! Fresh savage humor incoming...');
}

// Get random motivational quote for dashboard
export async function getDailyMotivation() {
  const today = new Date().toDateString();
  const cacheKey = `daily_${today}`;
  
  const prompt = `Generate ONE savage, hilarious motivational quote about consistency, discipline, or achieving goals.
  Make it PUNCHY, MEMORABLE, and DARKLY FUNNY like Duolingo.
  Can be inspirational OR brutally honest OR absurdly funny.
  Examples of the VIBE:
  - "Consistency is key... unless you're consistently trash 🗑️"
  - "Your future self either thanks you or roasts you. Choose wisely 🔥"
  - "Success is 1% talent, 99% not being a quitter. You got this... right? 😏"
  
  Be CREATIVE and FRESH. Never repeat common quotes. Add fire emoji if it fits!`;
  
  return getCachedMessage(cacheKey, prompt);
}
